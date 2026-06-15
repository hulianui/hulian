"use client";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { TrueFocusProps } from "./true-focus.types";

// 吸取自 reactbits.dev True Focus：句中一词清晰、余词模糊，焦点循环移动，四角框跟随聚焦词。
// 瑚琏化：角框色默认 chart token（吃主题）；测量焦点词 rect 定位框（ResizeObserver 跟随重排）；
// reduced-motion → 全清晰、无轮播、无移动框。减包：m + LazyMotionProvider 平滑框位移。
interface FrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function TrueFocus({
  sentence = "True Focus",
  separator = " ",
  blurAmount = 5,
  borderColor = "var(--color-chart-1)",
  animationDuration = 1.2,
  pauseBetweenAnimations = 0.6,
  manualMode = false,
  className,
  ...props
}: TrueFocusProps) {
  const reduce = useReducedMotion();
  const words = sentence.split(separator);
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [frame, setFrame] = useState<FrameRect | null>(null);

  // 受控场景下 sentence 变短时，旧 index 可能越界（手动模式无 %words.length 自愈），
  // 导致 wordRefs.current[index] 为 undefined、焦点框悬空。统一收敛到有效范围内。
  const safeIndex = words.length > 0 ? Math.min(index, words.length - 1) : 0;
  useEffect(() => {
    if (index > safeIndex) setIndex(safeIndex);
  }, [index, safeIndex]);

  // 自动轮播（非手动、非 reduce）
  useEffect(() => {
    if (manualMode || reduce || words.length <= 1) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % words.length),
      (animationDuration + pauseBetweenAnimations) * 1000,
    );
    return () => clearInterval(id);
  }, [manualMode, reduce, words.length, animationDuration, pauseBetweenAnimations]);

  // 测量焦点词位置（相对容器），随重排/窗口尺寸更新
  useEffect(() => {
    const measure = () => {
      const container = containerRef.current;
      const el = wordRefs.current[safeIndex];
      if (!container || !el) return;
      const c = container.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      setFrame({ x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height });
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [safeIndex, sentence, separator]);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-wrap items-center justify-center gap-x-3 gap-y-2", className)}
      style={{ "--hulian-focus-border": borderColor } as CSSProperties}
      {...props}
    >
      {words.map((word, i) => {
        const focused = reduce || i === safeIndex;
        return (
          <span
            key={i}
            ref={(el) => {
              wordRefs.current[i] = el;
            }}
            onMouseEnter={manualMode ? () => setIndex(i) : undefined}
            className="relative cursor-default transition-[filter,opacity] duration-300"
            style={{
              filter: focused ? "blur(0px)" : `blur(${blurAmount}px)`,
              opacity: focused ? 1 : 0.7,
            }}
          >
            {word}
          </span>
        );
      })}

      {frame && !reduce && (
        <LazyMotionProvider>
          <m.div
            aria-hidden
            className="pointer-events-none absolute left-0 top-0"
            animate={{ x: frame.x - 6, y: frame.y - 6, width: frame.w + 12, height: frame.h + 12 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ width: frame.w + 12, height: frame.h + 12 }}
          >
            <Corner className="left-0 top-0 border-l-2 border-t-2" />
            <Corner className="right-0 top-0 border-r-2 border-t-2" />
            <Corner className="bottom-0 left-0 border-b-2 border-l-2" />
            <Corner className="bottom-0 right-0 border-b-2 border-r-2" />
          </m.div>
        </LazyMotionProvider>
      )}
    </div>
  );
}

function Corner({ className }: { className: string }) {
  return (
    <span
      className={cn("absolute h-3 w-3 rounded-[1px]", className)}
      style={{ borderColor: "var(--hulian-focus-border)" }}
    />
  );
}
