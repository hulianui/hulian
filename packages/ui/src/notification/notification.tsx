"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CircleCheck, CircleX, Info, TriangleAlert } from "../_icons";
import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { motionDuration, overlayTransitions } from "../motion";
import type {
  NotificationInstance,
  NotificationOptions,
  NotificationPlacement,
  NotificationType,
} from "./notification.types";

// 比 Toast 更重的通知：标题+描述+图标+操作区，可指定四角位置。机制照 Toast——
// 模块级全局单例 store + 单挂 Provider，触发与渲染解耦。自研零依赖（不走 Base UI toast，
// 因需四角 viewport + 富卡片）；进出场用 CSS transition 驱动（motion-token 镜像，零运行时）。

interface NotificationRecord {
  id: string;
  type: NotificationType;
  options: NotificationOptions;
  open: boolean; // 置 false 触发出场过渡，过渡时长后从 store 移除
}

const PLACEMENTS: NotificationPlacement[] = ["topRight", "topLeft", "bottomRight", "bottomLeft"];
const EXIT_MS = motionDuration.base * 1000 + 30; // 出场过渡时长后兜底移除

function createNotificationManager() {
  let records: NotificationRecord[] = [];
  const listeners = new Set<() => void>();
  let seq = 0;
  const emit = () => {
    for (const l of listeners) l();
  };
  const set = (next: NotificationRecord[]) => {
    records = next;
    emit();
  };
  return {
    subscribe(cb: () => void) {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    getSnapshot() {
      return records;
    },
    add(type: NotificationType, options: NotificationOptions) {
      const id = `hulian-notification-${seq++}`;
      set([...records, { id, type, options, open: true }]);
      return id;
    },
    close(id: string) {
      const rec = records.find((r) => r.id === id);
      if (!rec || !rec.open) return; // 已在关闭中 → 不重复触发 onClose
      rec.options.onClose?.();
      set(records.map((r) => (r.id === id ? { ...r, open: false } : r)));
    },
    remove(id: string) {
      set(records.filter((r) => r.id !== id));
    },
  };
}

/** 模块级单例 manager —— 框架无关、SSR 安全。 */
export const hulianNotificationManager = createNotificationManager();

function open(type: NotificationType, options: NotificationOptions): NotificationInstance {
  const id = hulianNotificationManager.add(type, options);
  return { destroy: () => hulianNotificationManager.close(id) };
}

/** 命令式通知 API。页面任意处可调，只要挂了一个 <NotificationProvider/>。 */
export const notification = {
  open: (options: NotificationOptions) => open("open", options),
  success: (options: NotificationOptions) => open("success", options),
  error: (options: NotificationOptions) => open("error", options),
  info: (options: NotificationOptions) => open("info", options),
  warning: (options: NotificationOptions) => open("warning", options),
};

// type → 默认图标（open 无图标）+ 语义色 + 左边条（token 取值同 Alert：info→--color-info，#173）。
const typeIcon: Partial<Record<NotificationType, typeof Info>> = {
  success: CircleCheck,
  error: CircleX,
  info: Info,
  warning: TriangleAlert,
};
const typeColor: Record<NotificationType, string> = {
  open: "text-foreground",
  success: "text-success",
  error: "text-danger",
  info: "text-info",
  warning: "text-warning",
};
const typeBorder: Record<NotificationType, string> = {
  open: "border-l-border",
  success: "border-l-success",
  error: "border-l-danger",
  info: "border-l-info",
  warning: "border-l-warning",
};

function NotificationCard({ record }: { record: NotificationRecord }) {
  const { id, type, options, open: isOpen } = record;
  const { title, description, icon, btn, duration = 4500, placement = "topRight" } = options;
  const [entered, setEntered] = useState(false);
  const locale = useComponentLocale().notification ?? { close: "关闭" };

  // 入场：挂载下一帧翻 entered，触发 transform/opacity 过渡
  useEffect(() => {
    const r = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(r);
  }, []);

  // 自动关闭（duration=0 不自动关）
  useEffect(() => {
    if (duration > 0) {
      const t = setTimeout(() => hulianNotificationManager.close(id), duration);
      return () => clearTimeout(t);
    }
  }, [id, duration]);

  // 出场：open 置 false 后，过渡时长兜底移除（不依赖 transitionend，jsdom 安全）
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => hulianNotificationManager.remove(id), EXIT_MS);
      return () => clearTimeout(t);
    }
  }, [id, isOpen]);

  const isRight = placement.endsWith("Right");
  const hidden = !entered || !isOpen; // 入场前 or 出场中
  const slide = hidden
    ? isRight
      ? "translate-x-3 opacity-0"
      : "-translate-x-3 opacity-0"
    : "translate-x-0 opacity-100";

  const Icon = typeIcon[type];
  const iconNode = icon ?? (Icon ? <Icon className="size-5" aria-hidden /> : null);

  return (
    <div
      className={cn(
        "pointer-events-auto w-full rounded-[var(--radius)] border border-l-2 border-hairline bg-surface p-4 shadow-lg",
        typeBorder[type],
        slide,
      )}
      style={overlayTransitions.popup}
      role={type === "error" ? "alert" : "status"}
    >
      {/* items-start：关闭按钮是外层 flex 的第三个子项，外层不设 items-* 时默认 stretch，
          它的高度跟着卡片走 —— 卡片越高 X 看起来越往下飘。锚到顶端与标题同一水平线（#137）。 */}
      <div className="flex items-start gap-3">
        {iconNode && <span className={cn("mt-0.5 shrink-0", typeColor[type])}>{iconNode}</span>}
        <div className="min-w-0 flex-1">
          {title && <div className="text-sm font-medium text-foreground">{title}</div>}
          {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
          {/* 按钮跟着内容左边缘走，不右对齐。右对齐是**对话框**的惯例（那里用户必须做选择，
              按钮在右下角是操作流的终点）；通知是被动出现的信息卡，用户大概率不操作，按钮是
              「顺带提供的入口」，应与标题、描述形成一条视觉列（#137）。 */}
          {btn && <div className="mt-3 flex gap-2">{btn}</div>}
        </div>
        <button
          type="button"
          aria-label={locale.close}
          onClick={() => hulianNotificationManager.close(id)}
          className="shrink-0 rounded-[var(--radius)] p-0.5 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// 四角 viewport 定位 + 堆叠方向（底部用 col-reverse 让新条贴边）。
const viewportClass: Record<NotificationPlacement, string> = {
  topRight: "top-4 right-4 items-end flex-col",
  topLeft: "top-4 left-4 items-start flex-col",
  bottomRight: "bottom-4 right-4 items-end flex-col-reverse",
  bottomLeft: "bottom-4 left-4 items-start flex-col-reverse",
};

/** 单挂一次（推荐 /components 段 layout）。订阅全局 store，按 placement 分组渲染四角堆叠。 */
export function NotificationProvider() {
  const records = useSyncExternalStore(
    hulianNotificationManager.subscribe,
    hulianNotificationManager.getSnapshot,
    hulianNotificationManager.getSnapshot,
  );
  return (
    <>
      {PLACEMENTS.map((placement) => {
        const group = records.filter((r) => (r.options.placement ?? "topRight") === placement);
        if (group.length === 0) return null;
        return (
          <div
            key={placement}
            className={cn(
              "pointer-events-none fixed z-[60] flex w-[min(92vw,24rem)] gap-3",
              viewportClass[placement],
            )}
          >
            {group.map((r) => (
              <NotificationCard key={r.id} record={r} />
            ))}
          </div>
        );
      })}
    </>
  );
}
