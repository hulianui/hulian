"use client";
import type { ComponentProps } from "react";
import { Tooltip as BaseTooltip } from "@base-ui-components/react/tooltip";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { TooltipContentProps } from "./tooltip.types";

// overlay 自管 mount/unmount；用瑚琏 motion token 的 CSS 镜像驱动 Base UI 原生过渡（与 Dialog 同手感）。
// transition 简写(而非 transitionDuration/TimingFunction 长写)：Base UI 过渡期会往内联 style 注入
// transition 简写，与长写混在同一 style 对象 → React "shorthand/longhand 混用" 警告并丢弃长写。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
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
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          {children}
          {/* 箭头：Base UI 的 arrowStyles 只设交叉轴居中(top/bottom→left，left/right→top)，
              垂直于边的那一轴它不管 → 必须按 data-side 自己把箭头推到 popup 边缘外，否则缩在
              内部被 -z-10 盖住("缺箭头")。方块 8px 旋 45° 成菱形，偏移 -4px 让中心落在边上，
              内半被 popup 盖住、外半露成尖。 */}
          <BaseTooltip.Arrow
            className={cn(
              "-z-10",
              "data-[side=top]:bottom-[-4px] data-[side=bottom]:top-[-4px]",
              "data-[side=left]:right-[-4px] data-[side=right]:left-[-4px]",
            )}
          >
            <span className="block h-2 w-2 rotate-45 bg-foreground" />
          </BaseTooltip.Arrow>
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
