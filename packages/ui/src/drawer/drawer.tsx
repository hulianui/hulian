"use client";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { DrawerContentProps } from "./drawer.types";

// 同 dialog.tsx：overlay 自管 mount/unmount，用 motion token CSS 镜像驱动原生过渡，零 motion 运行时。
// transition 简写(而非长写)：Base UI 过渡期会往内联 style 注入 transition 简写，与长写混用 →
// React "shorthand/longhand 混用" 警告并丢弃长写。简写同时覆盖 transform(panel 滑动)+opacity(backdrop 淡入)。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

// side 决定贴边定位 + 尺寸 + 内边框 + 关闭态 translate（落在 starting/ending-style → 滑入/滑出）。
export const drawerVariants = cva(
  [
    // 定位（fixed/absolute）由 DrawerContent 按 container 决定，故不写死在这里。
    "z-50 flex flex-col gap-1 bg-surface border-hairline p-6 text-foreground shadow-xl outline-none",
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
  footer,
  container,
  className,
}: DrawerContentProps) {
  // 提供 container（如手机框 ref）→ 抽屉就地 portal 进该元素并改用 absolute 定位，
  // 贴该容器的边而非视口（容器须 position:relative + overflow-hidden）。否则默认 fixed 贴视口。
  const contained = container != null;
  const place = contained ? "absolute" : "fixed";
  return (
    <BaseDialog.Portal container={container}>
      <BaseDialog.Backdrop
        className={cn(
          place,
          "inset-0 z-40 bg-black/40 backdrop-blur-sm data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        )}
        style={overlayTransition}
      />
      <BaseDialog.Popup className={cn(place, drawerVariants({ side }), className)} style={overlayTransition}>
        {title && <BaseDialog.Title className="text-lg font-semibold">{title}</BaseDialog.Title>}
        {description && (
          <BaseDialog.Description className="text-sm text-muted">
            {description}
          </BaseDialog.Description>
        )}
        {/* 正文独立滚动，长内容不挤压 footer，footer 始终钉底可见 */}
        <div className="mt-2 min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer != null && (
          <div className="mt-4 flex shrink-0 items-center justify-end gap-2 border-t border-border pt-4">
            {footer}
          </div>
        )}
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
