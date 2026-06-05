"use client";
import { useRef } from "react";
import type { MotionValue } from "motion/react";
import {
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { ScrollRevealProps } from "./scroll-reveal.types";

// 吸取自 React Bits ScrollReveal：整段文字随容器滚过视口先轻微旋转回正，再逐词从「淡 + 糊」解析到清晰。
// 瑚琏化：以 motion/react useScroll + useTransform 重写 gsap ScrollTrigger scrub（去 gsap 依赖）；
// 文字吃 text-foreground token；reduced-motion → 直接全清晰可读（DOM 两态一致）；减包：m + LazyMotionProvider。
interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  baseOpacity: number;
  enableBlur: boolean;
  blurStrength: number;
}

function Word({ children, progress, range, baseOpacity, enableBlur, blurStrength }: WordProps) {
  const opacity = useTransform(progress, range, [baseOpacity, 1]);
  const blurPx = useTransform(progress, range, [blurStrength, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  return (
    <m.span
      className="inline-block whitespace-pre"
      style={{ opacity, filter: enableBlur ? filter : undefined }}
    >
      {children}
    </m.span>
  );
}

export function ScrollReveal({
  children,
  baseOpacity = 0.12,
  baseRotation = 3,
  enableBlur = true,
  blurStrength = 4,
  className,
  style,
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  // 整段旋转：早一点开始、早一点结束，先把段落回正再逐词显影
  const { scrollYProgress: rotateProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.6"],
  });
  // 逐词显影：词在 [0,1] 上均分进度区间
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.3"],
  });
  const rotate = useTransform(rotateProgress, [0, 1], [baseRotation, 0]);

  // 按空白切并保留分隔（capture group），逐词分配滚动进度区间
  const segments = children.split(/(\s+)/).filter((s) => s !== "");
  const words = segments.filter((s) => !/^\s+$/.test(s));
  const total = words.length || 1;

  if (reduce) {
    return (
      <p ref={ref} className={cn("text-foreground", className)} style={style} {...props}>
        {children}
      </p>
    );
  }

  let wordIndex = 0;
  return (
    <LazyMotionProvider>
      <m.p
        ref={ref}
        className={cn("text-foreground [transform-origin:0%_50%]", className)}
        style={{ rotate, ...style }}
        {...props}
      >
        {segments.map((seg, i) => {
          if (/^\s+$/.test(seg)) {
            return (
              <span key={i} className="whitespace-pre">
                {seg}
              </span>
            );
          }
          const start = wordIndex / total;
          const end = (wordIndex + 1) / total;
          wordIndex += 1;
          return (
            <Word
              key={i}
              progress={scrollYProgress}
              range={[start, end]}
              baseOpacity={baseOpacity}
              enableBlur={enableBlur}
              blurStrength={blurStrength}
            >
              {seg}
            </Word>
          );
        })}
      </m.p>
    </LazyMotionProvider>
  );
}
