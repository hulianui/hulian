import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { MarqueeProps } from "./marquee.types";

// 吸取自 magicui.design Marquee：复制子项 N 份、每份 CSS 平移 -100% - gap → 无缝循环。
// 瑚琏化：纯 CSS（无 "use client"，可 RSC，同 Breadcrumb/Alert）；关键帧在 @hulian/tokens preset.css；
// reduced-motion 用 Tailwind motion-reduce: 变体停；容器中性、子项自带色（只消费语义 token）。
export function Marquee({
  children,
  direction = "left",
  duration = 40,
  gap = "1rem",
  pauseOnHover = false,
  repeat = 4,
  className,
  style,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn("group flex overflow-hidden [gap:var(--hulian-marquee-gap)]", className)}
      style={
        {
          "--hulian-marquee-duration": `${duration}s`,
          "--hulian-marquee-gap": gap,
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
            "[animation:hulian-marquee_var(--hulian-marquee-duration,40s)_linear_infinite]",
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
