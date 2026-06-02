"use client";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { DrawerContentProps } from "./drawer.types";

// 同 dialog.tsx：overlay 自管 mount/unmount，用 motion token CSS 镜像驱动原生过渡，零 motion 运行时。
const overlayTransition = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
} as const;

// side 决定贴边定位 + 尺寸 + 内边框 + 关闭态 translate（落在 starting/ending-style → 滑入/滑出）。
export const drawerVariants = cva(
  [
    "fixed z-50 flex flex-col gap-1 bg-surface border-border p-6 text-foreground shadow-xl outline-none",
    "transition-transform",
  ],
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full w-[min(90vw,24rem)] border-l data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
        left: "inset-y-0 left-0 h-full w-[min(90vw,24rem)] border-r data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
        top: "inset-x-0 top-0 w-full h-[min(90vh,20rem)] border-b data-[starting-style]:-translate-y-full data-[ending-style]:-translate-y-full",
        bottom:
          "inset-x-0 bottom-0 w-full h-[min(90vh,20rem)] border-t data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
      },
    },
    defaultVariants: { side: "right" },
  },
);

export function Drawer(props: ComponentProps<typeof BaseDialog.Root>) {
  return <BaseDialog.Root {...props} />;
}

export const DrawerTrigger = BaseDialog.Trigger;
export const DrawerClose = BaseDialog.Close;

export function DrawerContent({
  side = "right",
  title,
  description,
  children,
  className,
}: DrawerContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
        style={overlayTransition}
      />
      <BaseDialog.Popup className={cn(drawerVariants({ side }), className)} style={overlayTransition}>
        {title && <BaseDialog.Title className="text-lg font-semibold">{title}</BaseDialog.Title>}
        {description && (
          <BaseDialog.Description className="text-sm text-muted">
            {description}
          </BaseDialog.Description>
        )}
        <div className="mt-2 flex flex-1 flex-col">{children}</div>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
