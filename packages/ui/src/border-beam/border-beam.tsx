"use client";
import { type MotionStyle } from "motion/react";
import type { CSSProperties } from "react";
import { LazyMotionProvider, m } from "../motion";
import { cn } from "../lib/cn";
import type { BorderBeamProps } from "./border-beam.types";

// 吸取自 magicui.design Border Beam（verbatim 范式）：mask 只露边框 + motion.div 沿 offsetPath 绕边动 offsetDistance。
// 瑚琏化：光束色默认 primary→chart-2 token（吃明暗，替 magicui 写死 hex）；mask 用内联 style 组合（确定性，
// 不依赖 TW v4 新 mask 工具类可用性）。motion 运行时（必 "use client"）。
export function BorderBeam({
  size = 50,
  duration = 6,
  delay = 0,
  colorFrom = "var(--color-primary)",
  colorTo = "var(--color-chart-2)",
  reverse = false,
  initialOffset = 0,
  borderWidth = 1,
  className,
  style,
}: BorderBeamProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{
        border: `${borderWidth}px solid transparent`,
        maskImage: "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
        maskClip: "padding-box, border-box",
        maskComposite: "intersect",
        WebkitMaskComposite: "source-in",
      } as CSSProperties}
    >
      <LazyMotionProvider>
      <m.div
        className={cn(
          "absolute aspect-square bg-gradient-to-l from-[var(--hulian-beam-from)] via-[var(--hulian-beam-to)] to-transparent",
          className,
        )}
        style={
          {
            width: size,
            offsetPath: `rect(0 auto auto 0 round ${size}px)`,
            "--hulian-beam-from": colorFrom,
            "--hulian-beam-to": colorTo,
            ...style,
          } as MotionStyle
        }
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{ repeat: Infinity, ease: "linear", duration, delay: -delay }}
      />
      </LazyMotionProvider>
    </div>
  );
}
