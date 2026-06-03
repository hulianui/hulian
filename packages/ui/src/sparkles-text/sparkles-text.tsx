"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { SparklesTextProps } from "./sparkles-text.types";

// 吸取自 magicui.design Sparkles Text：文本周围随机生成的小星脉冲闪烁。
// 瑚琏化：星色默认 primary/chart token（吃明暗）；随机位置在 useEffect 客户端生成避 hydration mismatch；
// reduced-motion → 不生成星（DOM 仅文本）。减包：m + LazyMotionProvider(domAnimation) 取代全量 motion。
const DEFAULT_COLORS = ["var(--color-primary)", "var(--color-chart-1)"];

interface Sparkle {
  id: string;
  x: string;
  y: string;
  color: string;
  delay: number;
  scale: number;
}

export function SparklesText({
  children,
  colors = DEFAULT_COLORS,
  sparklesCount = 8,
  className,
  ...props
}: SparklesTextProps) {
  const reduce = useReducedMotion();
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (reduce) {
      setSparkles([]);
      return;
    }
    const gen = (): Sparkle => ({
      id: `${Math.random()}`,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
      scale: Math.random() * 0.6 + 0.4,
    });
    setSparkles(Array.from({ length: sparklesCount }, gen));
    const id = setInterval(() => {
      setSparkles((prev) => prev.map((s) => (Math.random() > 0.7 ? gen() : s)));
    }, 1200);
    return () => clearInterval(id);
  }, [reduce, sparklesCount, colors]);

  return (
    <span className={cn("relative inline-block", className)} {...props}>
      <LazyMotionProvider>
        {sparkles.map((s) => (
          <m.svg
            key={s.id}
            aria-hidden
            className="pointer-events-none absolute z-10"
            style={{ left: s.x, top: s.y, fill: s.color }}
            width="14"
            height="14"
            viewBox="0 0 21 21"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, s.scale, 0], opacity: [0, 1, 0], rotate: [0, 120] }}
            transition={{ duration: 1.4, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
          >
            <path d="M10.5 0C10.5 4.5 6 9 0 10.5 6 12 10.5 16.5 10.5 21 10.5 16.5 15 12 21 10.5 15 9 10.5 4.5 10.5 0Z" />
          </m.svg>
        ))}
      </LazyMotionProvider>
      <span className="relative z-20">{children}</span>
    </span>
  );
}
