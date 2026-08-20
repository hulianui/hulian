"use client";
import { type MotionStyle, useReducedMotion } from "motion/react";
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
  const reduce = useReducedMotion();
  // 光束是纯装饰层（absolute inset-0 pointer-events-none），不渲染既不影响布局也不丢信息。
  // 不选「停在某处」：静止的半段光带看着像渲染残留，比没有更糟。
  // 注意 motion 的 motion-reduce: 类变体够不着这里 —— 那是 CSS 动画的开关，
  // 而这道光束是 JS 驱动的 offsetDistance 补间，只能靠 useReducedMotion 判。
  if (reduce) return null;

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
