import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { AnimatedGradientTextProps } from "./animated-gradient-text.types";

// 吸取自 magicui.design Animated Gradient Text：行内徽标级渐变流动文本（区别 AuroraText 标题级）。
// 瑚琏化：纯 CSS（RSC 安全）；默认 chart token 渐变吃明暗；复用 hulian-aurora 关键帧（bg-size 200% 平移）。
const DEFAULT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

export function AnimatedGradientText({
  children,
  colors = DEFAULT_COLORS,
  speed = 1,
  className,
  style,
  ...props
}: AnimatedGradientTextProps) {
  const gradient = `linear-gradient(90deg, ${colors.join(", ")}, ${colors[0]})`;
  return (
    <span
      {...props}
      className={cn(
        "inline-block bg-clip-text font-medium text-transparent [background-size:200%_auto]",
        "[animation:hulian-aurora_var(--hulian-gradient-duration,8s)_linear_infinite] motion-reduce:[animation:none]",
        className,
      )}
      style={
        {
          backgroundImage: gradient,
          "--hulian-gradient-duration": `${8 / speed}s`,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </span>
  );
}
