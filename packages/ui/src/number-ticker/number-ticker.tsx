"use client";
import { useEffect, useRef } from "react";
import { animate, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { motionEase } from "../motion";
import { cn } from "../lib/cn";
import type { NumberTickerProps } from "./number-ticker.types";

/**
 * 纯函数：数字格式化（千分位 + 小数位）。独立可单测——动效本身靠截图，格式化逻辑靠单测。
 * 固定 en-US（千分位逗号，通用），locale 化列为 future。
 */
export function formatTicker(value: number, decimalPlaces: number): string {
  return Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(value.toFixed(decimalPlaces)));
}

// 吸取自 magicui.design NumberTicker，三处瑚琏化：
//   ① spring → tween 复用 motionEase.out 签名曲线（不另起弹簧体系）
//   ② text-black dark:text-white → text-foreground 语义 token
//   ③ 补 useReducedMotion（reduced 落终值不滚）
export function NumberTicker({
  value,
  startValue = 0,
  decimalPlaces = 0,
  duration = 1.2,
  delay = 0,
  className,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const mv = useMotionValue(startValue);
  const inView = useInView(ref, { once: true });

  // 滚动期：motionValue 每变化写一次格式化文本
  useMotionValueEvent(mv, "change", (latest) => {
    if (ref.current) ref.current.textContent = formatTicker(latest, decimalPlaces);
  });

  // 进入视口触发：reduced 直接落终值不滚；否则 tween 复用 motionEase.out
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration, delay, ease: motionEase.out });
    return () => controls.stop();
  }, [inView, reduced, value, duration, delay, mv]);

  // 关键：每次 render 把当前 motionValue 同步回 textContent，
  // 否则父级重渲染（明暗 toggle）会用 JSX children 覆盖回 startValue 且不再重滚 → 暗色截图会显错值。
  useEffect(() => {
    if (ref.current) ref.current.textContent = formatTicker(mv.get(), decimalPlaces);
  });

  return (
    <span ref={ref} className={cn("inline-block tabular-nums text-foreground", className)} {...props}>
      {formatTicker(startValue, decimalPlaces)}
    </span>
  );
}
