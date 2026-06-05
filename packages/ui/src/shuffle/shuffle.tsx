"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { ShuffleProps } from "./shuffle.types";

// 吸取自 React Bits Shuffle：逐字「洗牌/解密」——每个字位先滚动随机乱码，再按方向顺序锁定为真字。
// 瑚琏化：去掉 gsap / ScrollTrigger / SplitText 三件套，改纯 requestAnimationFrame + motion useInView；
// "use client" + useReducedMotion 门控（reduced-motion 直接渲染终态文本，DOM 两态字符一致，避 reveal 不可见坑）；
// 颜色走 token（text-foreground），乱码态 text-muted，无品牌硬编码色。

const DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&@*";

function pick(set: string): string {
  return set.charAt(Math.floor(Math.random() * set.length)) || " ";
}

// 直接读 prefers-reduced-motion，作为 motion useReducedMotion 的兜底：
// motion 的 hook 内部用模块级单例缓存首次初始化结果，跨组件/跨用例若 matchMedia
// 在首次初始化之后才变更，单例不会刷新；这里再独立查一次媒体查询，确保读到当前真实值。
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Shuffle({
  text,
  duration = 0.6,
  shuffleDirection = "right",
  scrambleCharset = DEFAULT_CHARSET,
  loop = false,
  loopDelay = 1,
  triggerOnView = true,
  triggerOnce = true,
  triggerOnHover = false,
  tag = "p",
  textAlign = "center",
  onShuffleComplete,
  className,
  style,
}: ShuffleProps) {
  const reduceMotionHook = useReducedMotion();
  const reduce = reduceMotionHook || prefersReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, {
    once: triggerOnce,
    amount: 0.1,
  });

  // 当前每个字位展示的字符（受控渲染，SSR 与首帧给终态 text，避免水合不一致）
  const [display, setDisplay] = useState<string>(text);
  const rafRef = useRef<number | null>(null);
  const loopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);
  const completeRef = useRef(onShuffleComplete);
  completeRef.current = onShuffleComplete;

  const chars = useMemo(() => Array.from(text), [text]);

  const stop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    if (loopTimerRef.current != null) clearTimeout(loopTimerRef.current);
    rafRef.current = null;
    loopTimerRef.current = null;
    runningRef.current = false;
  }, []);

  const run = useCallback(() => {
    if (runningRef.current) return;
    // reduced-motion：跳过洗牌，直接落终态（保持 DOM 字符与动画态一致）
    if (reduce) {
      setDisplay(text);
      completeRef.current?.();
      if (loop) {
        loopTimerRef.current = setTimeout(run, loopDelay * 1000);
      }
      return;
    }

    runningRef.current = true;
    const total = chars.length;
    const totalMs = Math.max(1, duration * 1000);
    const start =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    const tick = () => {
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const progress = Math.min(1, (now - start) / totalMs);
      // 已锁定的字位数：随进度推进
      const settled = Math.floor(progress * total);

      const next = chars.map((ch, i) => {
        if (ch === " " || ch === "\n") return ch;
        // 按方向决定解析顺序：right 从左往右锁，left 从右往左锁
        const order = shuffleDirection === "left" ? total - 1 - i : i;
        if (order < settled) return ch; // 已锁定为真字
        return pick(scrambleCharset); // 仍在洗牌
      });
      setDisplay(next.join(""));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // 完成
      setDisplay(text);
      runningRef.current = false;
      rafRef.current = null;
      completeRef.current?.();
      if (loop) {
        loopTimerRef.current = setTimeout(() => {
          runningRef.current = false;
          run();
        }, loopDelay * 1000);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [
    chars,
    duration,
    loop,
    loopDelay,
    reduce,
    scrambleCharset,
    shuffleDirection,
    text,
  ]);

  // 触发：进入视口（或不依赖视口时挂载即触发）
  useEffect(() => {
    if (triggerOnView && !inView) return;
    run();
    return stop;
    // text 变化也应重洗
  }, [inView, triggerOnView, run, stop, text]);

  const handleEnter = useCallback(() => {
    if (!triggerOnHover) return;
    if (runningRef.current) return;
    run();
  }, [triggerOnHover, run]);

  const Tag = (tag || "p") as "p";
  const mergedStyle = useMemo(
    () => ({ textAlign, ...style }),
    [textAlign, style],
  );

  return (
    <Tag
      ref={ref as React.Ref<HTMLParagraphElement>}
      onMouseEnter={handleEnter}
      style={mergedStyle}
      // aria-label 保真终态文本，乱码态对读屏无障碍
      aria-label={text}
      className={cn(
        "inline-block whitespace-pre-wrap break-words font-mono tabular-nums text-foreground",
        "[font-variant-ligatures:none] leading-none",
        className,
      )}
    >
      <span aria-hidden="true">{display}</span>
    </Tag>
  );
}
