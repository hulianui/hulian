"use client";
import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { BlurTextProps } from "./blur-text.types";

// 吸取自 reactbits.dev Blur Text：滚入视口时各段（词/字符）从「模糊 + 位移」分两步解析到清晰，逐段错峰成波浪。
// 瑚琏化：useInView once 触发一次；整段挂 aria-label、各段 aria-hidden（屏幕阅读器读整句不读碎段）；
//        reduced-motion → 直接渲染清晰终态（DOM 两态一致，避 reveal 不可见坑）；token 配色由 className 决定不写死。
// 减包：m + LazyMotionProvider(domAnimation)；用 hook 控 animate（非 whileInView）；
//      filter:blur 走两段关键帧（blur→半清晰过冲→清晰），近似原版 gsap 的 10px→5px→0 观感。
export function BlurText({
  text,
  splitType = "word",
  direction = "top",
  delay = 120,
  blur = 8,
  stepDuration = 0.5,
  threshold = 0.3,
  onAnimationComplete,
  className,
  ...props
}: BlurTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, amount: threshold });
  const reduce = useReducedMotion();

  // word 模式用 split 捕获组保留空白段（渲染原样空格），char 模式 Array.from 正确处理 CJK / emoji。
  const segments = splitType === "word" ? text.split(/(\s+)/) : Array.from(text);

  const y = direction === "top" ? -16 : 16;
  const overshoot = direction === "top" ? 4 : -4;
  const hidden = { opacity: 0, y, filter: `blur(${blur}px)` };
  const clear = { opacity: 1, y: 0, filter: "blur(0px)" };
  // 两段过冲：先到半清晰（opacity 0.6 / blur 半 / 反向轻微过冲），再落定清晰。
  // reduced-motion → 直接给清晰终态（不走中间关键帧），避免位移/模糊扫屏。
  const shown = reduce
    ? clear
    : {
        opacity: [0, 0.6, 1],
        y: [y, overshoot, 0],
        filter: [`blur(${blur}px)`, `blur(${blur / 2}px)`, "blur(0px)"],
      };

  const last = segments.filter((s) => s !== "" && !/^\s+$/.test(s)).length - 1;
  let visibleIndex = -1;

  return (
    <p
      ref={ref}
      aria-label={text}
      className={cn("inline-flex flex-wrap", className)}
      {...props}
    >
      <LazyMotionProvider>
        {segments.map((seg, i) => {
          if (seg === "") return null;
          if (/^\s+$/.test(seg)) {
            return (
              <span key={i} aria-hidden className="whitespace-pre">
                {seg}
              </span>
            );
          }
          visibleIndex += 1;
          const vi = visibleIndex;
          const isLast = vi === last;
          return (
            <m.span
              key={i}
              aria-hidden
              className="inline-block whitespace-pre will-change-[transform,filter,opacity]"
              initial={reduce ? false : hidden}
              animate={inView || reduce ? shown : hidden}
              transition={
                reduce
                  ? { duration: 0 }
                  : { duration: stepDuration, delay: (vi * delay) / 1000, ease: "easeOut" }
              }
              onAnimationComplete={
                isLast && onAnimationComplete ? onAnimationComplete : undefined
              }
            >
              {seg}
            </m.span>
          );
        })}
      </LazyMotionProvider>
    </p>
  );
}
