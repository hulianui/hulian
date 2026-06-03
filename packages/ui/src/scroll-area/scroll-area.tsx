"use client";
import { ScrollArea as BaseScrollArea } from "@base-ui-components/react/scroll-area";
import { cn } from "../lib/cn";
import type { ScrollAreaProps } from "./scroll-area.types";

// 自定义细滚动条（对应 HeroUI ScrollShadow 的「滚动美化」诉求，做法是定制滚动条而非渐变遮罩）。
// keepMounted：保证滚动条在 DOM（含不可滚/jsdom 无布局场景），避免视口不可滚时整条消失。
export function ScrollArea({ className, orientation = "vertical", children }: ScrollAreaProps) {
  const showV = orientation === "vertical" || orientation === "both";
  const showH = orientation === "horizontal" || orientation === "both";
  return (
    <BaseScrollArea.Root className={cn("relative overflow-hidden rounded-[var(--radius)]", className)}>
      <BaseScrollArea.Viewport className="size-full overscroll-contain rounded-[inherit] outline-none">
        {children}
      </BaseScrollArea.Viewport>
      {showV && (
        <BaseScrollArea.Scrollbar
          orientation="vertical"
          keepMounted
          className="flex w-2 touch-none select-none p-0.5"
        >
          <BaseScrollArea.Thumb className="flex-1 rounded-full bg-border transition-colors hover:bg-muted" />
        </BaseScrollArea.Scrollbar>
      )}
      {showH && (
        <BaseScrollArea.Scrollbar
          orientation="horizontal"
          keepMounted
          className="flex h-2 flex-col touch-none select-none p-0.5"
        >
          <BaseScrollArea.Thumb className="flex-1 rounded-full bg-border transition-colors hover:bg-muted" />
        </BaseScrollArea.Scrollbar>
      )}
      {orientation === "both" && <BaseScrollArea.Corner />}
    </BaseScrollArea.Root>
  );
}
