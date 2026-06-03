import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { StripedPatternProps } from "./striped-pattern.types";

// 吸取自 magicui.design Striped Pattern：纯 repeating-linear-gradient 斜条纹，无 SVG 无动画。
// 瑚琏化：纯 CSS（RSC 安全）；条纹色 currentColor（根 text-border，可 className 覆盖吃主题）；
// 几何（角度/单元宽）走内联 CSS 变量，gradient 用变量引用。背景层：absolute inset-0 + pointer-events-none。
export function StripedPattern({ angle = 45, size = 10, className, style, ...props }: StripedPatternProps) {
  return (
    <div
      aria-hidden
      {...props}
      className={cn("pointer-events-none absolute inset-0 h-full w-full text-border", className)}
      style={
        {
          "--hulian-striped-angle": `${angle}deg`,
          "--hulian-striped-size": `${size}px`,
          backgroundImage:
            "repeating-linear-gradient(var(--hulian-striped-angle, 45deg), currentColor 0, currentColor 1px, transparent 1px, transparent var(--hulian-striped-size, 10px))",
          ...style,
        } as CSSProperties
      }
    />
  );
}
