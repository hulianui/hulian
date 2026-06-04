import { cn } from "../lib/cn";
import type { SpotlightProps } from "./spotlight.types";

// 径向辉光背景（auth / hero / 空状态常用）：单个 radial-gradient 从辉光色渐隐到底色。
// 瑚琏化：纯 div + CSS（无 "use client"，可 RSC，同 DotPattern/StripedPattern）；
// color-mix 吃 var(--color-bg)，明暗自动适配；背景装饰层 absolute inset-0 + pointer-events-none。
// 用法：父容器 relative，<Spotlight /> 作背景层，内容以 relative z-10 叠加其上。
export function Spotlight({
  color = "var(--color-primary)",
  intensity = 14,
  x = "50%",
  y = "0%",
  size = "125%",
  fade = 55,
  className,
  style,
  ...props
}: SpotlightProps) {
  return (
    <div
      aria-hidden
      {...props}
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        background: `radial-gradient(${size} ${size} at ${x} ${y}, color-mix(in oklab, ${color} ${intensity}%, var(--color-bg)) 0%, var(--color-bg) ${fade}%)`,
        ...style,
      }}
    />
  );
}
