"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { ActionSheetContentProps } from "./action-sheet.types";

// 移动端动作面板（底滑·建在 Base UI Dialog 上，同 drawer 范式：overlay 自管 mount，motion token CSS 镜像驱动过渡，零 motion 运行时）。
// 每个动作即一个 Dialog.Close（点击先跑 onClick 再自然关闭）；底部独立「取消」块。底部吃安全区 inset。
const sheetTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

export function ActionSheet(props: ComponentProps<typeof BaseDialog.Root>) {
  return <BaseDialog.Root {...props} />;
}

export const ActionSheetTrigger = BaseDialog.Trigger;
export const ActionSheetClose = BaseDialog.Close;

export function ActionSheetContent({
  title,
  description,
  actions,
  cancelText = "取消",
  container,
  className,
}: ActionSheetContentProps) {
  return (
    <BaseDialog.Portal container={container}>
      <BaseDialog.Backdrop
        className={cn(
          // 有 container 时用 absolute（贴容器）；否则 fixed（贴视口）。
          container ? "absolute" : "fixed",
          "inset-0 z-40 bg-black/40 backdrop-blur-sm data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
        )}
        style={sheetTransition}
      />
      <BaseDialog.Popup
        className={cn(
          container ? "absolute" : "fixed",
          "inset-x-0 bottom-0 z-50 mx-auto flex max-w-md flex-col gap-2 p-3 outline-none",
          "data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
          className,
        )}
        style={{ ...sheetTransition, paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
      >
        {(title || description) && (
          <div className="rounded-[var(--radius)] bg-surface px-4 py-3 text-center">
            {title && (
              <BaseDialog.Title className="text-sm font-medium text-foreground">{title}</BaseDialog.Title>
            )}
            {description && (
              <BaseDialog.Description className="mt-0.5 text-xs text-muted">
                {description}
              </BaseDialog.Description>
            )}
          </div>
        )}
        <div className="flex flex-col overflow-hidden rounded-[var(--radius)] bg-surface">
          {actions.map((a, i) => (
            <BaseDialog.Close
              key={a.key}
              disabled={a.disabled}
              onClick={() => a.onClick?.()}
              className={cn(
                "flex w-full flex-col items-center gap-0.5 px-4 py-3.5 text-center outline-none transition-colors",
                i > 0 && "border-t border-border",
                a.disabled ? "pointer-events-none opacity-40" : "hover:bg-surface-hover focus-visible:bg-surface-hover",
                a.danger ? "text-danger" : "text-foreground",
              )}
            >
              <span className="text-sm font-medium">{a.label}</span>
              {a.description && <span className="text-xs text-muted">{a.description}</span>}
            </BaseDialog.Close>
          ))}
        </div>
        {cancelText !== null && (
          <BaseDialog.Close className="rounded-[var(--radius)] bg-surface px-4 py-3.5 text-sm font-semibold text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover">
            {cancelText}
          </BaseDialog.Close>
        )}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
