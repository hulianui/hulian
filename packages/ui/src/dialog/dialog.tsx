"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { DialogContentProps } from "./dialog.types";

// overlay 自管 mount/unmount（Base UI 等过渡结束才卸载），故不接 motion 的 AnimatePresence，
// 改用瑚琏动效 token 驱动其原生过渡 —— 与 Button(motion) 共享同一手感曲线，零混库。
// 用 transition 简写(而非长写)：Base UI 在过渡生命周期会往内联 style 注入 transition 简写，与长写
// 混在同一 style 对象 → React "shorthand/longhand 混用" 警告并丢弃长写。简写同属性覆盖无混用 → 警告消除。
// 同时覆盖 opacity+transform：backdrop 仅 opacity 变化(transform 段为空操作)，popup 两者皆动。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

export function Dialog(props: ComponentProps<typeof BaseDialog.Root>) {
  return <BaseDialog.Root {...props} />;
}

export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

export function DialogContent({ title, description, children, footer, className }: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
        style={overlayTransition}
      />
      <BaseDialog.Popup
        className={cn(
          // 三段式：max-h 封顶 + flex column，标题/footer 不压缩，正文自己滚。
          // 不封顶时长表单会顶穿视口，footer 被推到屏幕外 → 确定按钮点不到（DrawerContent
          // 早已是这个写法，Dialog 此前漏了，两者行为不一致）。
          "fixed left-1/2 top-1/2 z-50 flex max-h-[85dvh] w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-[var(--radius)] border border-hairline bg-surface p-6 text-foreground shadow-xl outline-none",
          "data-[starting-style]:scale-[0.96] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.96] data-[ending-style]:opacity-0",
          className,
        )}
        style={overlayTransition}
      >
        <BaseDialog.Title className="shrink-0 text-lg font-semibold">{title}</BaseDialog.Title>
        {description && (
          <BaseDialog.Description className="mt-1 shrink-0 text-sm text-muted">
            {description}
          </BaseDialog.Description>
        )}
        {/* min-h-0 必需：flex item 默认 min-height:auto，不给 0 则正文撑开父级、overflow 永不生效 */}
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer != null && (
          <div className="mt-6 flex shrink-0 items-center justify-end gap-2 border-t border-border pt-4">
            {footer}
          </div>
        )}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
