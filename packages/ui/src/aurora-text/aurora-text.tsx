import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { AuroraTextProps } from "./aurora-text.types";

// 吸取自 magicui.design Aurora Text：bg-clip-text 透明文字 + 流动渐变背景(bg-size 200%)。
// 瑚琏化：纯 CSS（RSC 安全，无 "use client"）；默认色用瑚琏 chart token（自动吃明暗，替 magicui 写死 hex）；
// 双层 span——sr-only 真文本给 AT，aria-hidden 渐变层只作视觉；关键帧 hulian-aurora 落 preset.css。
const DEFAULT_COLORS = [
  "var(--color-primary)",
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
];

export function AuroraText({
  children,
  colors = DEFAULT_COLORS,
  speed = 1,
  className,
  style,
  ...props
}: AuroraTextProps) {
  const gradient = `linear-gradient(135deg, ${colors.join(", ")}, ${colors[0]})`;
  return (
    <span className={cn("relative inline-block", className)} {...props}>
      <span className="sr-only">{children}</span>
      <span
        aria-hidden
        className="relative bg-clip-text text-transparent [background-size:200%_auto] [animation:hulian-aurora_var(--hulian-aurora-duration,10s)_linear_infinite] motion-reduce:[animation:none]"
        style={
          {
            backgroundImage: gradient,
            "--hulian-aurora-duration": `${10 / speed}s`,
            ...style,
          } as CSSProperties
        }
      >
        {children}
      </span>
    </span>
  );
}
