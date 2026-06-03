import { useId } from "react";
import { cn } from "../lib/cn";
import type { GridPatternProps } from "./grid-pattern.types";

// 吸取自 magicui.design Grid Pattern：SVG <pattern> 内一条 <path> 画单元右+下两边即成网格，rect 全填。
// 瑚琏化：纯 SVG（RSC 安全）；path stroke=currentColor + fill=none，根 svg 默认 text-border；
// useId 防多实例 id 撞车。背景装饰层：absolute inset-0 + pointer-events-none。
export function GridPattern({
  width = 40,
  height = 40,
  x = 0,
  y = 0,
  strokeDasharray = 0,
  className,
  ...props
}: GridPatternProps) {
  const id = useId();
  return (
    <svg
      aria-hidden
      {...props}
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full stroke-current text-border",
        className,
      )}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M ${width} 0 L 0 0 0 ${height}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
