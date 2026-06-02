"use client";
import type { ComponentProps } from "react";
import { Tooltip as BaseTooltip } from "@base-ui-components/react/tooltip";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { TooltipContentProps } from "./tooltip.types";

// overlay 自管 mount/unmount；用瑚琏 motion token 的 CSS 镜像驱动 Base UI 原生过渡（与 Dialog 同手感）。
const overlayTransition = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
} as const;

export function Tooltip(props: ComponentProps<typeof BaseTooltip.Root>) {
  return <BaseTooltip.Root {...props} />;
}

export const TooltipTrigger = BaseTooltip.Trigger;
export const TooltipProvider = BaseTooltip.Provider; // 可选：多 tooltip 共享 delay 分组 / 设 delay

export function TooltipContent({
  children,
  side = "top",
  align = "center",
  sideOffset = 8,
  className,
}: TooltipContentProps) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BaseTooltip.Popup
          className={cn(
            "rounded-[var(--radius)] bg-foreground px-2.5 py-1 text-xs text-bg shadow-md outline-none",
            "transition-[opacity,transform] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          {children}
          {/* 箭头：Base UI Positioner 沿边居中定位，瑚琏给皮肤；旋转方块成尖。几何在 D3 Playwright 调。 */}
          <BaseTooltip.Arrow className="-z-10">
            <span className="block h-2 w-2 rotate-45 bg-foreground" />
          </BaseTooltip.Arrow>
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
