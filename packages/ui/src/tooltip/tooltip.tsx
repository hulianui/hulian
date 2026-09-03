"use client";
import type { ComponentProps } from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { cn } from "../lib/cn";
import { motionDurationCss, transitionCss } from "../motion";
import type { TooltipContentProps } from "./tooltip.types";

// overlay 自管 mount/unmount；用瑚琏 motion token 的 CSS 镜像驱动 Base UI 原生过渡（与 Dialog 同手感）。
// transition 简写(而非 transitionDuration/TimingFunction 长写)：Base UI 过渡期会往内联 style 注入
// transition 简写，与长写混在同一 style 对象 → React "shorthand/longhand 混用" 警告并丢弃长写。
//
// 时长走 CSS 变量 + fallback 而非写死：内联 style 的优先级最高，className 覆盖不了它，
// 但**变量**可以由 className 规则设定（内联这边只读 var）。这样下面的 data-[instant]
// 才能把同一条内联 transition 的时长压到 0。变量不设默认值、只用 fallback，避免内联反过来锁死它。
const tooltipDuration = `var(--hl-tooltip-duration, ${motionDurationCss.base})`;

const overlayTransition = {
  transition: transitionCss(
    { property: "opacity", duration: tooltipDuration },
    { property: "transform", duration: tooltipDuration },
  ),
} as const;

// 同一 Provider 分组内已有 tooltip 打开时，再 hover 相邻触发器 → Base UI 打上 data-instant，
// 此时跳过延迟直接显示。动画也必须一并跳过：工具栏上连续扫过若每个都重播 200ms 缩放，
// 整排按钮会显得黏糊。首个 tooltip 保留延迟+动画（防误触），后续瞬时 —— 这一快一慢的对比
// 正是"整个工具栏变快了"的来源。
const INSTANT_CLASS = "data-[instant]:[--hl-tooltip-duration:0ms]";

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
            "origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            INSTANT_CLASS,
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
