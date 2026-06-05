"use client";
import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { SplitFrom, SplitTextProps } from "./split-text.types";

// 吸取自 reactbits.dev Split Text：文本切成字/词，滚入视口时逐段错峰位移淡入。
// 瑚琏化：useInView 只触发一次（once）；整段挂 aria-label、各段 aria-hidden，
// 读屏读整句不读碎字；reduced-motion → 直接呈现终态（DOM 两态一致，避 reveal 不可见坑）。
// 减包：m + LazyMotionProvider(domAnimation)。位移/透明走 hook 控 animate（非 whileInView），
// 不依赖 LazyMotion 是否含 inview feature。
const FROM: Record<SplitFrom, { x?: number; y?: number; opacity: number }> = {
  bottom: { y: 24, opacity: 0 },
  top: { y: -24, opacity: 0 },
  left: { x: -24, opacity: 0 },
  right: { x: 24, opacity: 0 },
};

export function SplitText({
  text,
  splitType = "char",
  from = "bottom",
  delay = 40,
  duration = 0.5,
  className,
  ...props
}: SplitTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();

  // word：按空白切并保留分隔（用 capture group），char：Array.from 按码点切（中文/emoji 安全）
  const segments = splitType === "word" ? text.split(/(\s+)/) : Array.from(text);
  const hidden = FROM[from];

  return (
    <span ref={ref} aria-label={text} className={cn("inline-block", className)} {...props}>
      <LazyMotionProvider>
        {segments.map((seg, i) => {
          if (seg === "" ) return null;
          if (/^\s+$/.test(seg)) {
            // 纯空白段不参与动画，按原样保留排版宽度
            return (
              <span key={i} aria-hidden className="whitespace-pre">
                {seg}
              </span>
            );
          }
          return (
            <m.span
              key={i}
              aria-hidden
              className="inline-block whitespace-pre"
              initial={reduce ? false : hidden}
              animate={
                inView || reduce ? { x: 0, y: 0, opacity: 1 } : hidden
              }
              transition={{ duration, delay: (i * delay) / 1000, ease: "easeOut" }}
            >
              {seg}
            </m.span>
          );
        })}
      </LazyMotionProvider>
    </span>
  );
}
