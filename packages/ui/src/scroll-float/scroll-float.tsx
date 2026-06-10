"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";
import {
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { ScrollFloatProps } from "./scroll-float.types";

// 吸取自 React Bits ScrollFloat：标题逐字符随容器滚过视口从「下沉 + 纵向拉伸压扁 + 透明」拔起到正常。
// 瑚琏化：去 gsap/ScrollTrigger，改用 motion useScroll + 每字符 useTransform 派生 opacity/y/scaleX/scaleY；
// 颜色吃 text-foreground token；reduced-motion → 直接渲染清晰标题（DOM 文本两态一致，避 reveal 不可见坑）；
// 减包：m + LazyMotionProvider。
//
// 滚动上下文自适应（修复画廊卡 0 进度坑）：
// - 未显式传 scrollContainerRef 时，自动绑定最近的可滚动祖先（overflow auto/scroll 且内容溢出），
//   而不是盲绑视口——否则放进内部滚动区（画廊预览 / 弹层 / 抽屉）时进度永远不动，
//   字符卡在 opacity 0 / 下沉压扁初始态（表现为空白或半截字头）。
// - 既无可滚祖先、页面也不可滚（无任何滚动上下文）→ 降级为 in-view 入场：进入视口后用 rAF
//   缓动把同一套进度从 0 推到 1，文字完整浮现可读，不会永远隐形。
const NBSP = "\u00A0";

type ScrollCtx = "pending" | "container" | "viewport" | "none";

function findScrollableAncestor(from: HTMLElement | null): HTMLElement | null {
  let el = from?.parentElement ?? null;
  while (el && el !== document.body && el !== document.documentElement) {
    const { overflowY } = getComputedStyle(el);
    const clips = overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
    if (clips && el.scrollHeight > el.clientHeight + 1) return el;
    el = el.parentElement;
  }
  return null;
}

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

  const autoContainerRef = useRef<HTMLElement | null>(null);
  const [ctx, setCtx] = useState<ScrollCtx>(() => (scrollContainerRef ? "container" : "pending"));

  // 必须声明在 useScroll 之前：两者同为 layout effect，按声明序先探测滚动上下文、useScroll 再订阅。
  useLayoutEffect(() => {
    if (scrollContainerRef) {
      setCtx("container");
      return;
    }
    const found = findScrollableAncestor(ref.current);
    if (found) {
      autoContainerRef.current = found;
      // useScroll 要求容器非 static 定位才能算对 target 偏移（否则 dev 告警 + 进度可能错位）。
      let restorePosition: (() => void) | undefined;
      if (getComputedStyle(found).position === "static") {
        const prev = found.style.position;
        found.style.position = "relative";
        restorePosition = () => {
          found.style.position = prev;
        };
      }
      setCtx("container");
      return restorePosition;
    }
    const doc = document.documentElement;
    setCtx(doc.scrollHeight > doc.clientHeight + 1 ? "viewport" : "none");
  }, [scrollContainerRef]);

  const containerRef = scrollContainerRef ?? autoContainerRef;
  const { scrollYProgress } = useScroll({
    target: ref,
    // 注意：useScroll 对「.current 为 null 的 ref」会一直等 hydrate 不订阅，
    // 视口模式必须传 undefined 而不是空 ref。
    container: (ctx === "container" ? containerRef : undefined) as never,
    offset: offset as never,
  });

  // 无滚动上下文的兜底进度：进入视口后 easeOutCubic 0→1，复用同一套字符错峰区间。
  const entranceProgress = useMotionValue(0);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  useEffect(() => {
    if (ctx !== "none" || !inView) return;
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      entranceProgress.set(1 - (1 - t) ** 3);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ctx, inView, entranceProgress]);

  // 两路进度取大：滚动驱动时入场进度恒 0 不干扰；无滚动上下文时由入场进度接管。
  const progress = useTransform<number, number>(
    [scrollYProgress, entranceProgress],
    ([s, e]) => Math.max(s, e),
  );

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
                progress={progress}
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
