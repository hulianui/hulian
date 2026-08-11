"use client";
import type { ComponentProps } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { PopoverContentProps } from "./popover.types";

// transition 简写(而非 transitionDuration/TimingFunction 长写)：Base UI 过渡期会往内联 style 注入
// transition 简写，与长写混在同一 style 对象 → React "shorthand/longhand 混用" 警告并丢弃长写。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

export function Popover(props: ComponentProps<typeof BasePopover.Root>) {
  return <BasePopover.Root {...props} />;
}

export const PopoverTrigger = BasePopover.Trigger;
export const PopoverClose = BasePopover.Close;

export function PopoverContent({
  title,
  description,
  children,
  side = "bottom",
  align = "center",
  sideOffset = 8,
  plain = false,
  arrow = true,
  className,
}: PopoverContentProps) {
  const hasHeader = title != null || description != null;
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BasePopover.Popup
          className={cn(
            "w-[min(90vw,18rem)] rounded-[var(--radius)] border border-hairline bg-surface p-4 text-foreground shadow-xl outline-none",
            "origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          {title != null && (
            <BasePopover.Title className="text-sm font-semibold text-foreground">{title}</BasePopover.Title>
          )}
          {description != null && (
            <BasePopover.Description className="mt-1 text-xs text-muted-foreground">{description}</BasePopover.Description>
          )}
          {/* mt-2 是「与上方标题/说明拉开距离」，所以它只在真有标题或说明时才该出现：
              两者都没有时它变成浮层顶部一条消不掉的 8px 空白（className 落在 Popup 上，够不着这层），
              贴边型浮层（顶部搜索行 / 日历面板）连 p-0 都救不回来（hulianui/hulian#172）。
              plain 则连这层皮肤一起不渲染：内容自带外观时，要的不是改皮肤而是没有皮肤。 */}
          {children != null &&
            (plain ? (
              children
            ) : (
              <div className={cn(hasHeader && "mt-2", "text-sm text-foreground")}>{children}</div>
            ))}
          {/* 箭头：Base UI arrowStyles 只设交叉轴居中、不管垂直于边那轴 → 必须按 data-side 自己把
              箭头推出 popup 边缘并旋转。旋转放在外层(data-side 在外层 div 上)：方块带 border-b/r 的
              角(BR)默认朝东南，转到哪侧就让该角朝外、边框续上 popup 边线；内层 span 不再自转。 */}
          {arrow && (
            <BasePopover.Arrow
              className={cn(
                "-z-10",
                "data-[side=top]:bottom-[-4px] data-[side=top]:rotate-45",
                "data-[side=bottom]:top-[-4px] data-[side=bottom]:rotate-[225deg]",
                "data-[side=left]:right-[-4px] data-[side=left]:rotate-[315deg]",
                "data-[side=right]:left-[-4px] data-[side=right]:rotate-[135deg]",
              )}
            >
              <span className="block h-2 w-2 border-b border-r border-border bg-surface" />
            </BasePopover.Arrow>
          )}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
