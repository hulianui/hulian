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
  blend = "bg",
  className,
  style,
  ...props
}: SpotlightProps) {
  // 单值 = 正圆（宽高同值），两值（"60% 70%"）= 椭圆，原样交给 radial-gradient。
  const extent = size.trim().includes(" ") ? size.trim() : `${size} ${size}`;
  // bg：渐隐到页面底色，自身就是一块不透明背景；transparent：渐隐到透明，叠在纹理/图片上不遮挡。
  const base = blend === "transparent" ? "transparent" : "var(--color-bg)";
  return (
    <div
      aria-hidden
      {...props}
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        background: `radial-gradient(${extent} at ${x} ${y}, color-mix(in oklab, ${color} ${intensity}%, ${base}) 0%, ${base} ${fade}%)`,
        ...style,
      }}
    />
  );
}
