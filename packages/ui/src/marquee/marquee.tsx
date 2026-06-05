import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { MarqueeProps } from "./marquee.types";

// 吸取自 magicui.design Marquee：复制子项 N 份、每份 CSS 平移 -100% - gap → 无缝循环。
// 瑚琏化：纯 CSS（无 "use client"，可 RSC，同 Breadcrumb/Alert）；关键帧在 @hulianui/tokens preset.css；
// reduced-motion 用 Tailwind motion-reduce: 变体停；容器中性、子项自带色（只消费语义 token）。
// fade：两端 mask-image 渐隐，做 logo / 图标墙的标志性观感；vertical：沿 Y 轴滚动。
export function Marquee({
  children,
  direction = "left",
  duration = 40,
  gap = "1rem",
  pauseOnHover = false,
  repeat = 4,
  vertical = false,
  fade = false,
  fadeWidth = "15%",
  className,
  style,
  ...props
}: MarqueeProps) {
  // mask 只看 alpha 通道，black=可见 / transparent=隐藏，与配色无关，故可用字面量。
  const maskAxis = vertical ? "to bottom" : "to right";
  const maskImage = fade
    ? `linear-gradient(${maskAxis}, transparent, black var(--hulian-marquee-fade), black calc(100% - var(--hulian-marquee-fade)), transparent)`
    : undefined;

  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden [gap:var(--hulian-marquee-gap)]",
        vertical ? "flex-col" : "flex-row",
        className,
      )}
      style={
        {
          "--hulian-marquee-duration": `${duration}s`,
          "--hulian-marquee-gap": gap,
          "--hulian-marquee-fade": fadeWidth,
          ...(maskImage && { maskImage, WebkitMaskImage: maskImage }),
          ...style,
        } as CSSProperties
      }
    >
      {Array.from({ length: repeat }).map((_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 || undefined}
          className={cn(
            "flex shrink-0 justify-around [gap:var(--hulian-marquee-gap)]",
            vertical ? "flex-col" : "flex-row",
            vertical
              ? "[animation:hulian-marquee-vertical_var(--hulian-marquee-duration,40s)_linear_infinite]"
              : "[animation:hulian-marquee_var(--hulian-marquee-duration,40s)_linear_infinite]",
            direction === "right" && "[animation-direction:reverse]",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            "motion-reduce:[animation:none]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
