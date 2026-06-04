import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { DotProps, DotTone } from "./dot.types";

// Dot = 独立状态圆点原语（Tag/Chip 内嵌圆点的单独可用版）：纯 CSS（无 hook，可 RSC）。
// 状态指示（在线/离线/进行中）、列表前导标记、品牌点。pulse 用内置 animate-ping 呼吸扩散。
// 仅消费语义 token，自动吃主题明暗。
const toneClass: Record<DotTone, string> = {
  neutral: "bg-muted",
  brand: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export const dotVariants = cva("relative inline-flex shrink-0 rounded-full", {
  variants: {
    size: {
      sm: "size-1.5",
      md: "size-2",
      lg: "size-2.5",
    },
  },
  defaultVariants: { size: "md" },
});

export function Dot({ tone = "neutral", size, pulse, label, className, ...props }: DotProps) {
  // 有 label → 表意圆点（role=status 让读屏播报）；无 label → 装饰（aria-hidden）
  const a11y = label
    ? { role: "status" as const, "aria-label": label }
    : { "aria-hidden": true as const };
  return (
    <span className={cn(dotVariants({ size }), toneClass[tone], className)} {...a11y} {...props}>
      {pulse && (
        <span
          className={cn("absolute inset-0 inline-flex animate-ping rounded-full opacity-60", toneClass[tone])}
          aria-hidden
        />
      )}
    </span>
  );
}
