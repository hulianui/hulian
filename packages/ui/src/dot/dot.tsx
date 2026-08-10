import { memo } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import type { DotProps, DotTone } from "./dot.types";

// Dot = 独立状态圆点原语（Tag/Chip 内嵌圆点的单独可用版）：纯 CSS（无 hook，可 RSC）。
// 状态指示（在线/离线/进行中）、列表前导标记、品牌点。pulse 用内置 animate-ping 呼吸扩散。
// 仅消费语义 token，自动吃主题明暗。
//
// tone 是五档语义快捷方式；color 走 resolveTone 接任意色（图例圆点要跟图表序列同色，
// 而序列色的默认取值 chart-1..6 五档 tone 根本接不住）——与 Brand.color / ChartSeries.color 同路。
const toneClass: Record<DotTone, string> = {
  neutral: "bg-muted-foreground",
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

function DotImpl({ tone = "neutral", color, size, pulse, label, className, style, ...props }: DotProps) {
  // 有 label → 表意圆点（role=status 让读屏播报）；无 label → 装饰（aria-hidden）
  const a11y = label
    ? { role: "status" as const, "aria-label": label }
    : { "aria-hidden": true as const };
  // color 命中时接管背景色，tone 的 bg-* 工具类让位（否则两者打架，胜负看类序不看意图）。
  const custom = resolveTone(color);
  const bgClass = custom ? undefined : toneClass[tone];
  // 消费方显式 style 仍能覆盖（逃生口），故放在自家 backgroundColor 之后。
  const bgStyle = custom ? { backgroundColor: custom, ...style } : style;
  return (
    <span className={cn(dotVariants({ size }), bgClass, className)} style={bgStyle} {...a11y} {...props}>
      {pulse && (
        <span
          className={cn("absolute inset-0 inline-flex animate-ping rounded-full opacity-60", bgClass)}
          style={custom ? { backgroundColor: custom } : undefined}
          aria-hidden
        />
      )}
    </span>
  );
}
DotImpl.displayName = "Dot";

// 圆点是全库复用最密的原语之一（状态列、图例、列表前导标记成百上千地渲染），
// props 全是稳定原语时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const Dot = memo(DotImpl);
Dot.displayName = "Dot";
