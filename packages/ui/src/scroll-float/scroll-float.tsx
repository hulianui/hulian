"use client";
import { useRef } from "react";
import type { MotionValue } from "motion/react";
import { useReducedMotion, useScroll, useTransform } from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { ScrollFloatProps } from "./scroll-float.types";

// 吸取自 React Bits ScrollFloat：标题逐字符随容器滚过视口从「下沉 + 纵向拉伸压扁 + 透明」拔起到正常。
// 瑚琏化：去 gsap/ScrollTrigger，改用 motion useScroll + 每字符 useTransform 派生 opacity/y/scaleX/scaleY；
// 颜色吃 text-foreground token；reduced-motion → 直接渲染清晰标题（DOM 文本两态一致，避 reveal 不可见坑）；
// 减包：m + LazyMotionProvider。
const NBSP = "\u00A0";

interface CharProps {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
  yPercent: number;
  scaleY: number;
  scaleX: number;
}

function Char({ char, progress, range, yPercent, scaleY, scaleX }: CharProps) {
  const opacity = useTransform(progress, range, [0, 1]);
  const y = useTransform(progress, range, [`${yPercent}%`, "0%"]);
  const sy = useTransform(progress, range, [scaleY, 1]);
  const sx = useTransform(progress, range, [scaleX, 1]);
  return (
    <m.span
      className="inline-block will-change-transform"
      style={{ opacity, y, scaleY: sy, scaleX: sx, transformOrigin: "50% 0%" }}
    >
      {char === " " ? NBSP : char}
    </m.span>
  );
}

export function ScrollFloat({
  children,
  scrollContainerRef,
  offset = ["start 0.9", "start 0.35"],
  stagger = 0.4,
  yPercent = 120,
  scaleY = 2.3,
  scaleX = 0.7,
  containerClassName,
  textClassName,
  className,
  ...props
}: ScrollFloatProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    container: (scrollContainerRef ?? undefined) as never,
    offset: offset as never,
  });

  const text = typeof children === "string" ? children : "";
  const chars = text.split("");
  const total = chars.length || 1;
  // stagger 越大字符错峰越明显；每字符窗口宽度收敛到 (1-stagger)，沿进度逐个滑动。
  const span = Math.max(0.0001, 1 - stagger);

  const containerCls = cn("overflow-hidden text-foreground", containerClassName, className);
  const textCls = cn(
    "inline-block text-center text-4xl font-black leading-tight md:text-6xl",
    textClassName,
  );

  if (reduce) {
    return (
      <h2 ref={ref} className={containerCls} {...props}>
        <span className={textCls}>{text}</span>
      </h2>
    );
  }

  return (
    <h2 ref={ref} className={containerCls} {...props}>
      <span className={textCls}>
        <LazyMotionProvider>
          {chars.map((char, i) => {
            const start = (i / total) * stagger;
            const end = Math.min(1, start + span);
            return (
              <Char
                key={i}
                char={char}
                progress={scrollYProgress}
                range={[start, end]}
                yPercent={yPercent}
                scaleY={scaleY}
                scaleX={scaleX}
              />
            );
          })}
        </LazyMotionProvider>
      </span>
    </h2>
  );
}
