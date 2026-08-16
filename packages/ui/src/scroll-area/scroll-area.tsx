"use client";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { cn } from "../lib/cn";
import type { ScrollAreaProps } from "./scroll-area.types";

// 自定义细滚动条（对应 HeroUI ScrollShadow 的「滚动美化」诉求，做法是定制滚动条而非渐变遮罩）。
// keepMounted：保证滚动条在 DOM（含不可滚/jsdom 无布局场景），避免视口不可滚时整条消失。
//
// 非声明方向锁死（#287）：Base UI 给 Viewport 写的是内联 `overflow: scroll`（两轴都可滚、原生条隐藏），
// 只要内容比视口宽哪怕 1px，orientation="vertical" 的区域也能被触控板横扫 / shift+滚轮推着走，
// 没有任何滚动条提示，观感像布局坏了。声明了只滚哪个方向，另一个方向就该是 hidden；
// 内联样式压不过，只能带 `!`。
const VIEWPORT_AXIS_LOCK = {
  vertical: "overflow-x-hidden!",
  horizontal: "overflow-y-hidden!",
  both: "",
} as const;

export function ScrollArea({ className, orientation = "vertical", children }: ScrollAreaProps) {
  const showV = orientation === "vertical" || orientation === "both";
  const showH = orientation === "horizontal" || orientation === "both";
  return (
    <BaseScrollArea.Root className={cn("relative overflow-hidden rounded-[var(--radius)]", className)}>
      <BaseScrollArea.Viewport
        className={cn(
          "size-full overscroll-contain rounded-[inherit] outline-none",
          VIEWPORT_AXIS_LOCK[orientation],
        )}
      >
        {children}
      </BaseScrollArea.Viewport>
      {showV && (
        <BaseScrollArea.Scrollbar
          orientation="vertical"
          keepMounted
          className="flex w-2 touch-none select-none p-0.5"
        >
          <BaseScrollArea.Thumb className="flex-1 rounded-full bg-border transition-colors hover:bg-muted-foreground" />
        </BaseScrollArea.Scrollbar>
      )}
      {showH && (
        <BaseScrollArea.Scrollbar
          orientation="horizontal"
          keepMounted
          className="flex h-2 flex-col touch-none select-none p-0.5"
        >
          <BaseScrollArea.Thumb className="flex-1 rounded-full bg-border transition-colors hover:bg-muted-foreground" />
        </BaseScrollArea.Scrollbar>
      )}
      {orientation === "both" && <BaseScrollArea.Corner />}
    </BaseScrollArea.Root>
  );
}
