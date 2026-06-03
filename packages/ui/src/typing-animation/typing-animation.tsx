"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { TypingAnimationProps } from "./typing-animation.types";

// 吸取自 magicui.design Typing Animation（瑚琏简化版）：单串逐字打字 + 闪烁光标 + 进入视口触发。
// 砍 magicui 的多词删除状态机/三 cursorStyle（YAGNI）。reduced-motion → 直接显全文（DOM 终态一致）。
// 关键帧 hulian-blink 落 preset.css。motion 运行时（必 "use client"）。
export function TypingAnimation({
  text,
  duration = 80,
  delay = 0,
  startOnView = true,
  showCursor = true,
  className,
  ...props
}: TypingAnimationProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);

  const chars = Array.from(text);
  const shouldStart = startOnView ? inView : true;
  const done = count >= chars.length;

  useEffect(() => {
    if (reduce) {
      setCount(chars.length);
      return;
    }
    if (!shouldStart) return;
    let id: ReturnType<typeof setInterval> | null = null;
    const startTimer = setTimeout(() => {
      id = setInterval(() => {
        setCount((c) => {
          if (c >= chars.length) {
            if (id) clearInterval(id);
            return c;
          }
          return c + 1;
        });
      }, duration);
    }, delay);
    return () => {
      clearTimeout(startTimer);
      if (id) clearInterval(id);
    };
  }, [shouldStart, reduce, duration, delay, text]);

  return (
    <span ref={ref} className={cn("inline-block", className)} {...props}>
      {chars.slice(0, count).join("")}
      {showCursor && !done && (
        <span aria-hidden className="ml-0.5 inline-block [animation:hulian-blink_1s_step-end_infinite] motion-reduce:[animation:none]">
          |
        </span>
      )}
    </span>
  );
}
