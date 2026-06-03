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

  // 内联用法对齐坑：inline-block + overflow-hidden 会把盒子「基线」改成下边缘，
  // 默认 vertical-align:baseline 于是把该下边缘对到相邻文字基线 →「更稳」被顶高错位，
  // 叠加 py-1 底部内边距再加重偏移。改用 align-bottom 让盒底对齐行盒底部
  //（轮换词与相邻文字同字号 → 行盒一致 → 字形底对底即视觉对齐），并去掉 py-1。
  // overflow-hidden 仍按行盒裁切进/出场的 y 位移，无需额外 padding。
  return (
    <span className="inline-block overflow-hidden align-bottom">
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
