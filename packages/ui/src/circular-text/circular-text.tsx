"use client";
import { useState } from "react";
import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { CircularHover, CircularTextProps } from "./circular-text.types";

// 吸取自 reactbits.dev Circular Text：每字按等分角排到圆周，整体匀速自转，悬停调速。
// 瑚琏化：颜色继承 currentColor（吃 text-* token）；整段 aria-label、各字 aria-hidden；
// reduced-motion → 静态环形不自转。关键帧 hulian-spin 落 preset.css；纯 CSS 旋转 + 状态控时长。
const HOVER_FACTOR: Record<CircularHover, number> = {
  speedUp: 0.25,
  slow: 2,
  pause: Number.POSITIVE_INFINITY,
  goBonkers: 0.12,
};

export function CircularText({
  text,
  spinDuration = 20,
  onHover = "speedUp",
  radius = 80,
  className,
  style,
  ...props
}: CircularTextProps) {
  const reduce = useReducedMotion();
  const [hovering, setHovering] = useState(false);
  const chars = Array.from(text);
  const angle = chars.length > 0 ? 360 / chars.length : 0;

  const paused = hovering && onHover === "pause";
  // pause 走 animation-play-state 冻结，时长保持有限值（避免 Infinity 写进 CSS 简写）
  const factor = hovering && !paused ? HOVER_FACTOR[onHover] : 1;
  const duration = spinDuration * factor;
  const box = radius * 2;

  return (
    <div
      aria-label={text}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={cn("relative", className)}
      style={
        {
          width: box,
          height: box,
          animation: reduce ? undefined : `hulian-spin ${duration}s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      {chars.map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className="absolute left-1/2 top-1/2 inline-block leading-none"
          style={{
            height: radius,
            transformOrigin: "bottom center",
            transform: `translate(-50%, -100%) rotate(${i * angle}deg)`,
          }}
        >
          {ch}
        </span>
      ))}
    </div>
  );
}
