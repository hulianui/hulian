"use client";
import type { ComponentProps } from "react";
import { Popover as BasePopover } from "@base-ui-components/react/popover";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { PopoverContentProps } from "./popover.types";

const overlayTransition = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
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
  className,
}: PopoverContentProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BasePopover.Popup
          className={cn(
            "w-[min(90vw,18rem)] rounded-[var(--radius)] border border-border bg-surface p-4 text-foreground shadow-xl outline-none",
            "transition-[opacity,transform] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          {title != null && (
            <BasePopover.Title className="text-sm font-semibold text-foreground">{title}</BasePopover.Title>
          )}
          {description != null && (
            <BasePopover.Description className="mt-1 text-xs text-muted">{description}</BasePopover.Description>
          )}
          {children != null && <div className="mt-2 text-sm text-foreground">{children}</div>}
          {/* 箭头：surface 方块 + 外两边 border；几何/边方向 D3 Playwright 调。 */}
          <BasePopover.Arrow className="-z-10">
            <span className="block h-2 w-2 rotate-45 border-b border-r border-border bg-surface" />
          </BasePopover.Arrow>
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
