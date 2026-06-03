"use client";
import { AlertDialog as BaseAlertDialog } from "@base-ui-components/react/alert-dialog";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { AlertDialogContentProps } from "./alert-dialog.types";

// AlertDialog = Dialog 引擎 + 「强制显式决策」语义：默认不响应点遮罩/Esc 关闭（销毁/不可逆操作确认）。
// 装配/皮肤/过渡 100% 复刻 dialog.tsx（Portal+Backdrop+Popup + motion-token CSS 镜像，零 motion 运行时），
// 但走独立 alert-dialog primitive（不碰现有 Dialog 组件）。
// transition 简写(而非长写)：Base UI 过渡期会往内联 style 注入 transition 简写，与长写混用 →
// React "shorthand/longhand 混用" 警告并丢弃长写。简写同时覆盖 opacity(backdrop)+transform(popup)。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

export function AlertDialog(props: ComponentProps<typeof BaseAlertDialog.Root>) {
  return <BaseAlertDialog.Root {...props} />;
}

export const AlertDialogTrigger = BaseAlertDialog.Trigger;
export const AlertDialogClose = BaseAlertDialog.Close;

export function AlertDialogContent({ title, description, children, className }: AlertDialogContentProps) {
  return (
    <BaseAlertDialog.Portal>
      <BaseAlertDialog.Backdrop
        className="fixed inset-0 bg-black/40 backdrop-blur-sm data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
        style={overlayTransition}
      />
      <BaseAlertDialog.Popup
        className={cn(
          "fixed left-1/2 top-1/2 w-[min(90vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius)] border border-border bg-surface p-6 text-foreground shadow-xl outline-none",
          "data-[starting-style]:scale-[0.96] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.96] data-[ending-style]:opacity-0",
          className,
        )}
        style={overlayTransition}
      >
        <BaseAlertDialog.Title className="text-lg font-semibold">{title}</BaseAlertDialog.Title>
        {description && (
          <BaseAlertDialog.Description className="mt-1 text-sm text-muted">
            {description}
          </BaseAlertDialog.Description>
        )}
        <div className="mt-5 flex justify-end gap-2">{children}</div>
      </BaseAlertDialog.Popup>
    </BaseAlertDialog.Portal>
  );
}
