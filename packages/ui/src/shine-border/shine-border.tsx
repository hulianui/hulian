import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { ShineBorderProps } from "./shine-border.types";

// 吸取自 magicui.design Shine Border：渐变背景 + mask exclude 只留边框区 → 边框流光。
// 瑚琏化：纯 CSS（RSC 安全）；流光默认 chart token（吃明暗，替 magicui 写死 hex）；
// 关键帧 hulian-shine-border 落 preset.css；mask 用内联 style（确定性）。
const DEFAULT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
];

export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor = DEFAULT_COLORS,
  className,
  style,
}: ShineBorderProps) {
  const stops = Array.isArray(shineColor) ? shineColor.join(", ") : shineColor;
  return (
    <div
      style={
        {
          "--hulian-shine-duration": `${duration}s`,
          padding: `${borderWidth}px`,
          backgroundImage: `radial-gradient(transparent, transparent, ${stops}, transparent, transparent)`,
          backgroundSize: "300% 300%",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          ...style,
        } as CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position]",
        "[animation:hulian-shine-border_var(--hulian-shine-duration,14s)_linear_infinite] motion-reduce:[animation:none]",
        className,
      )}
    />
  );
}
