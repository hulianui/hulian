"use client";
import { useEffect, useRef } from "react";
import type { MotionValue } from "motion/react";
import {
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import { useScrollContext } from "../motion/scroll-context";
import type { ScrollRevealProps } from "./scroll-reveal.types";

// 吸取自 React Bits ScrollReveal：整段文字随容器滚过视口先轻微旋转回正，再逐词从「淡 + 糊」解析到清晰。
//
// 滚动上下文自适应（与 ScrollFloat 同一套，见 ../motion/scroll-context）：盲绑视口时，组件
// 一旦落在内部滚动区（文档站的 <main class="overflow-auto">、画廊预览框、抽屉）进度就永远是 0，
// 而 0 进度正是「baseOpacity + 模糊」的初始态 —— 整段文字近乎隐形，比不动更糟。
// 既无可滚祖先、页面也不可滚时降级为 in-view 入场，保证文字总能读到。
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
  scrollContainerRef,
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

  // 必须声明在 useScroll 之前：两者同为 layout effect，按声明序先探测滚动上下文、useScroll 再订阅。
  const { ctx, containerRef } = useScrollContext(ref, scrollContainerRef);
  // useScroll 对「.current 为 null 的 ref」会一直等 hydrate 不订阅，视口模式必须传 undefined。
  const container = (ctx === "container" ? containerRef : undefined) as never;

  // 整段旋转：早一点开始、早一点结束，先把段落回正再逐词显影
  const { scrollYProgress: rotateProgress } = useScroll({
    target: ref,
    container,
    offset: ["start end", "start 0.6"],
  });
  // 逐词显影：词在 [0,1] 上均分进度区间
  const { scrollYProgress: scrollProgress } = useScroll({
    target: ref,
    container,
    offset: ["start 0.85", "start 0.3"],
  });

  // 无任何滚动上下文（既没有可滚祖先、页面也不可滚）→ 进入视口后用 rAF 把进度推到 1，
  // 否则整段文字会永远停在 baseOpacity 上，看起来就是组件坏了。
  const entranceProgress = useMotionValue(0);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  useEffect(() => {
    if (ctx !== "none" || !inView) return;
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      entranceProgress.set(t * t * (3 - 2 * t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ctx, inView, entranceProgress]);

  // 两路进度取大：滚动驱动时入场进度恒 0 不干扰；无滚动上下文时由入场进度接管。
  const scrollYProgress = useTransform(
    [scrollProgress, entranceProgress] as never,
    ([a, b]: number[]) => Math.max(a, b),
  );
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
