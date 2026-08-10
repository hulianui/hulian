import { useId } from "react";
import { cn } from "../lib/cn";
import type { DotPatternProps } from "./dot-pattern.types";

// 吸取自 magicui.design Dot Pattern：SVG <pattern> 平铺一个 <circle>，rect 全填 url(#id)。
// 瑚琏化：纯 SVG（无 "use client"，可 RSC，同 Marquee/Breadcrumb）；circle fill=currentColor，
// 根 svg 默认 text-border（用户可 className 覆盖为 text-muted-foreground / text-primary，自动吃主题明暗）；
// useId 保证多实例 pattern id 不撞车（SSR 稳定）。背景装饰层：absolute inset-0 + pointer-events-none。
export function DotPattern({
  width = 16,
  height = 16,
  cx = 1,
  cy = 1,
  cr = 1,
  x = 0,
  y = 0,
  className,
  ...props
}: DotPatternProps) {
  const id = useId();
  return (
    <svg
      aria-hidden
      {...props}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-current text-border",
        className,
      )}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <circle cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
