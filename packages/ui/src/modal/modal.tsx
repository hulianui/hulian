"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { useState, useSyncExternalStore } from "react";
import { CircleCheck, CircleHelp, CircleX, Info, TriangleAlert } from "../_icons";
import { Button } from "../button/button";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { ModalInstance, ModalOptions, ModalType } from "./modal.types";

// 命令式对话框：触发(modal.confirm() 等)与渲染(<ModalProvider/>)解耦，机制照 Toast——
// 模块级全局单例 store + 单挂 Provider。渲染复用 Base UI Dialog 引擎(Portal+Backdrop+focus-trap)，
// 不另起 overlay。每条记录是一个受控 <Dialog.Root>，关闭走「open=false 触发出场过渡 → onOpenChangeComplete
// 卸载记录」两段式，与 dialog.tsx 一致零 motion 运行时。

interface ModalRecord {
  id: string;
  type: ModalType;
  options: ModalOptions;
  open: boolean; // 置 false 触发出场过渡，过渡结束才从 store 移除
}

function createModalManager() {
  let records: ModalRecord[] = [];
  const listeners = new Set<() => void>();
  let seq = 0;
  const emit = () => {
    for (const l of listeners) l();
  };
  const set = (next: ModalRecord[]) => {
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
    add(type: ModalType, options: ModalOptions) {
      const id = `hulian-modal-${seq++}`;
      set([...records, { id, type, options, open: true }]);
      return id;
    },
    update(id: string, next: Partial<ModalOptions>) {
      set(records.map((r) => (r.id === id ? { ...r, options: { ...r.options, ...next } } : r)));
    },
    close(id: string) {
      set(records.map((r) => (r.id === id ? { ...r, open: false } : r)));
    },
    remove(id: string) {
      set(records.filter((r) => r.id !== id));
    },
  };
}

/** 模块级单例 manager —— 框架无关、SSR 安全。导出供测试/高级场景使用。 */
export const hulianModalManager = createModalManager();

function open(type: ModalType, options: ModalOptions): ModalInstance {
  const id = hulianModalManager.add(type, options);
  return {
    destroy: () => hulianModalManager.close(id),
    update: (next) => hulianModalManager.update(id, next),
  };
}

/** 命令式对话框 API（区别于声明式 Dialog/AlertDialog）。页面任意处可调，只要挂了一个 <ModalProvider/>。 */
export const modal = {
  confirm: (options: ModalOptions) => open("confirm", options),
  info: (options: ModalOptions) => open("info", options),
  success: (options: ModalOptions) => open("success", options),
  error: (options: ModalOptions) => open("error", options),
  warning: (options: ModalOptions) => open("warning", options),
};

// type → 图标组件 + 语义色（吃 info/success/warning/danger 语义 token，明暗自适配）。
const typeIcon: Record<ModalType, typeof Info> = {
  confirm: CircleHelp,
  info: Info,
  success: CircleCheck,
  error: CircleX,
  warning: TriangleAlert,
};
const typeColor: Record<ModalType, string> = {
  // confirm 留主色：那是「请你做决定」的主操作语气；info 走独立 info 色（#173）。
  confirm: "text-primary",
  info: "text-info",
  success: "text-success",
  error: "text-danger",
  warning: "text-warning",
};

// 与 dialog.tsx 同：用 transition 简写，规避 Base UI 注入简写与长写混用的 React 警告。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

function ModalDialog({ record }: { record: ModalRecord }) {
  const { id, type, options, open: isOpen } = record;
  const [loading, setLoading] = useState(false);
  const Icon = typeIcon[type];

  const handleOk = async () => {
    const result = options.onOk?.();
    if (result instanceof Promise) {
      setLoading(true);
      try {
        await result;
        hulianModalManager.close(id);
      } catch {
        // reject → 保持打开，由调用方提示错误
      } finally {
        setLoading(false);
      }
    } else {
      hulianModalManager.close(id);
    }
  };

  const handleCancel = () => {
    options.onCancel?.();
    hulianModalManager.close(id);
  };

  return (
    <BaseDialog.Root
      open={isOpen}
      onOpenChange={(nextOpen) => {
        // 仅响应用户发起的关闭(Esc/点遮罩)；loading 中忽略关闭，避免中断异步确定
        if (!nextOpen && !loading) {
          options.onCancel?.();
          hulianModalManager.close(id);
        }
      }}
      onOpenChangeComplete={(nextOpen) => {
        if (!nextOpen) hulianModalManager.remove(id);
      }}
    >
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
          style={overlayTransition}
        />
        <BaseDialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(90vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius)] border border-hairline bg-surface p-6 text-foreground shadow-xl outline-none",
            "data-[starting-style]:scale-[0.96] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.96] data-[ending-style]:opacity-0",
          )}
          style={overlayTransition}
        >
          <div className="flex gap-3">
            <Icon className={cn("mt-0.5 size-5 shrink-0", typeColor[type])} aria-hidden />
            <div className="min-w-0 flex-1">
              {options.title && (
                <BaseDialog.Title className="text-base font-semibold">{options.title}</BaseDialog.Title>
              )}
              {options.content && (
                <BaseDialog.Description className="mt-1 text-sm text-muted-foreground">
                  {options.content}
                </BaseDialog.Description>
              )}
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            {type === "confirm" && (
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                {options.cancelText ?? "取消"}
              </Button>
            )}
            <Button onClick={handleOk} loading={loading}>
              {options.okText ?? "确定"}
            </Button>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

/** 单挂一次（推荐 /components 段 layout）。订阅全局 store，为每条记录渲一个 Dialog。 */
export function ModalProvider() {
  const records = useSyncExternalStore(
    hulianModalManager.subscribe,
    hulianModalManager.getSnapshot,
    hulianModalManager.getSnapshot,
  );
  return (
    <>
      {records.map((r) => (
        <ModalDialog key={r.id} record={r} />
      ))}
    </>
  );
}
