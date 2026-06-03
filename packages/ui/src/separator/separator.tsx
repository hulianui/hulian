"use client";
import { Separator as BaseSeparator } from "@base-ui-components/react/separator";
import { cn } from "../lib/cn";
import type { SeparatorProps } from "./separator.types";

// 纯几何薄包：Base UI Separator 渲 <div role="separator">，data-[orientation] 驱动横/竖。
// 只消费 border 语义 token。垂直态用 self-stretch 在 flex 容器内撑满高度。
export function Separator({ orientation = "horizontal", className }: SeparatorProps) {
  return (
    <BaseSeparator
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        "data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className,
      )}
    />
  );
}
