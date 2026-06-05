import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { GlitchTextProps } from "./glitch-text.types";

// 吸取自 reactbits.dev Glitch Text：两层伪元素 RGB 错位 + clip-path 切片抖动 = 数字故障感。
// 瑚琏化：撕裂色吃 chart token（吃明暗主题，不写死红/青）；主文本保持真实可读、可选中；
// 伪元素仅装饰（content:attr(data-text)）。关键帧 hulian-glitch-1/2 落 preset.css；
// motion-reduce → 去动画退普通文本。纯 CSS、零依赖、RSC 安全（无 "use client"）。
export function GlitchText({
  children,
  speed = 2.5,
  enableOnHover = false,
  className,
  style,
  ...props
}: GlitchTextProps) {
  // 两伪元素：c1 左移、c2 右移；clip-path 切片由关键帧驱动。duration 用 CSS 变量控。
  const base =
    "before:content-[attr(data-text)] before:absolute before:left-0 before:top-0 before:w-full " +
    "before:text-[color:var(--color-chart-1)] before:[text-shadow:-1px_0_var(--color-chart-1)] " +
    "after:content-[attr(data-text)] after:absolute after:left-0 after:top-0 after:w-full " +
    "after:text-[color:var(--color-chart-3)] after:[text-shadow:1px_0_var(--color-chart-3)]";
  const anim = enableOnHover
    ? "hover:before:[animation:hulian-glitch-1_var(--hulian-glitch-dur)_infinite_linear_alternate] " +
      "hover:after:[animation:hulian-glitch-2_calc(var(--hulian-glitch-dur)*1.3)_infinite_linear_alternate]"
    : "before:[animation:hulian-glitch-1_var(--hulian-glitch-dur)_infinite_linear_alternate] " +
      "after:[animation:hulian-glitch-2_calc(var(--hulian-glitch-dur)*1.3)_infinite_linear_alternate]";

  return (
    <span
      data-text={children}
      className={cn(
        "relative inline-block whitespace-nowrap text-foreground",
        base,
        anim,
        "motion-reduce:before:[animation:none] motion-reduce:after:[animation:none]",
        className,
      )}
      style={{ "--hulian-glitch-dur": `${speed}s`, ...style } as CSSProperties}
      {...props}
    >
      {children}
    </span>
  );
}
