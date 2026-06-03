import { cn } from "../lib/cn";
import type { SpacerProps } from "./spacer.types";

// 纯皮肤布局间距（可 RSC）。x/y 以 0.25rem 为单位，对齐 Tailwind spacing 刻度。
export function Spacer({ x = 1, y = 1, className }: SpacerProps) {
  return (
    <span
      aria-hidden
      className={cn("inline-block shrink-0", className)}
      style={{ width: `${x * 0.25}rem`, height: `${y * 0.25}rem` }}
    />
  );
}
