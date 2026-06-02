"use client";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { DialogContentProps } from "./dialog.types";

// overlay 自管 mount/unmount（Base UI 等过渡结束才卸载），故不接 motion 的 AnimatePresence，
// 改用瑚琏动效 token 的 CSS 镜像驱动其原生过渡 —— 与 Button(motion) 共享同一手感曲线，零混库。
const overlayTransition = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
} as const;

export function Dialog(props: ComponentProps<typeof BaseDialog.Root>) {
  return <BaseDialog.Root {...props} />;
}

export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

export function DialogContent({ title, description, children, className }: DialogContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
        style={overlayTransition}
      />
      <BaseDialog.Popup
        className={cn(
          "fixed left-1/2 top-1/2 w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius)] border border-border bg-surface p-6 text-foreground shadow-xl outline-none",
          "transition-all data-[starting-style]:scale-[0.96] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.96] data-[ending-style]:opacity-0",
          className,
        )}
        style={overlayTransition}
      >
        <BaseDialog.Title className="text-lg font-semibold">{title}</BaseDialog.Title>
        {description && (
          <BaseDialog.Description className="mt-1 text-sm text-muted">
            {description}
          </BaseDialog.Description>
        )}
        <div className="mt-4">{children}</div>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
