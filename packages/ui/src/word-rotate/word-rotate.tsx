"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { WordRotateProps } from "./word-rotate.types";

// 吸取自 magicui.design Word Rotate：AnimatePresence mode=wait 轮换词，进出场 y 位移淡入淡出。
// 瑚琏化：motion 运行时（必 "use client"）；reduced-motion → 仍轮换但去动画（DOM 两态一致，避 reveal 不可见坑）。
export function WordRotate({ words, duration = 2500, className, ...props }: WordRotateProps) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (words.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), duration);
    return () => clearInterval(id);
  }, [words, duration]);

  const anim = reduce
    ? {}
    : {
        initial: { opacity: 0, y: -28 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 28 },
        transition: { duration: 0.25, ease: "easeOut" as const },
      };

  return (
    <span className="inline-block overflow-hidden py-1">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          className={cn("inline-block", className)}
          {...anim}
          {...props}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
