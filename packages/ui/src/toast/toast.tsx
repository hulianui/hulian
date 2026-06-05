"use client";
import { Toast } from "@base-ui-components/react/toast";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { ToastOptions, ToastTone } from "./toast.types";

// 模块级全局单例 manager：触发(toast())与渲染(<ToastProvider/>)解耦。框架无关、SSR 安全。
const hulianToastManager = Toast.createToastManager();

/** 命令式触发一条 toast。返回 toast id。页面任意处可调，只要挂了一个 <ToastProvider/>。 */
export function toast(options: ToastOptions): string {
  const { title, description, tone = "neutral", timeout } = options;
  return hulianToastManager.add({
    title,
    description,
    type: tone, // 用 Base UI type 承载瑚琏 tone，列表里据此上皮肤
    priority: tone === "danger" ? "high" : "low", // 错误 urgent 播报，其余 polite
    ...(timeout !== undefined && { timeout }),
  });
}

// tone → 左边条 + 标题着色（与 Alert 语义 token 一致；neutral 用中性 border/foreground）。
const toneBorder: Record<ToastTone, string> = {
  info: "border-l-primary",
  danger: "border-l-danger",
  neutral: "border-l-border",
};
const toneTitle: Record<ToastTone, string> = {
  info: "text-primary",
  danger: "text-danger",
  neutral: "text-foreground",
};

// transition 简写(而非 transitionDuration/TimingFunction 长写)：Base UI 过渡期会往内联 style 注入
// transition 简写，与长写混在同一 style 对象 → React "shorthand/longhand 混用" 警告并丢弃长写。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((t) => {
    const tone = (t.type as ToastTone) ?? "neutral";
    return (
      <Toast.Root
        key={t.id}
        toast={t}
        className={cn(
          "flex items-start gap-3 rounded-[var(--radius)] border border-l-2 border-hairline bg-surface p-4 shadow-lg",
          toneBorder[tone] ?? toneBorder.neutral,
          // 进出场：滑入 + 淡入，用 motion-token CSS 镜像驱动 Base UI data-* 过渡
          "data-[starting-style]:translate-x-4 data-[starting-style]:opacity-0 data-[ending-style]:translate-x-4 data-[ending-style]:opacity-0",
        )}
        style={overlayTransition}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Toast.Title className={cn("text-sm font-medium", toneTitle[tone] ?? toneTitle.neutral)} />
          <Toast.Description className="text-sm text-muted" />
        </div>
        <Toast.Close
          aria-label="关闭"
          className="shrink-0 rounded-[var(--radius)] p-0.5 text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </Toast.Close>
      </Toast.Root>
    );
  });
}

/** 单挂一次（推荐 /components 段 layout）。含 Viewport + 列表；自闭合，无需外部 children。 */
export function ToastProvider() {
  return (
    <Toast.Provider toastManager={hulianToastManager}>
      <Toast.Viewport className="fixed right-4 top-4 z-[60] flex w-[min(90vw,22rem)] flex-col gap-2 outline-none">
        <ToastList />
      </Toast.Viewport>
    </Toast.Provider>
  );
}
