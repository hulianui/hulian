"use client";
import { Children } from "react";
import { useReducedMotion } from "motion/react";
import { LazyMotionProvider, m } from "../motion";
import { cn } from "../lib/cn";
import type { AnimatedListProps } from "./animated-list.types";

// 吸取自 magicui.design Animated List：子项逐个淡入+上移入场（motion，必 "use client"）。
// 瑚琏化：进入视口触发(whileInView once)；reduced-motion → 直接显示（去动画，DOM 两态一致避不可见坑）。
// 减包：m + LazyMotionProvider(domAnimation) 取代全量 motion。
export function AnimatedList({ children, stagger = 0.15, className }: AnimatedListProps) {
  const reduce = useReducedMotion();
  const items = Children.toArray(children);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <LazyMotionProvider>
        {items.map((child, i) => (
          <m.div
            key={i}
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.98 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * stagger, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {child}
          </m.div>
        ))}
      </LazyMotionProvider>
    </div>
  );
}
