"use client";
import { type CSSProperties, useCallback, useMemo, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { PixelTransitionProps } from "./pixel-transition.types";

// 吸取自 React Bits PixelTransition：两层内容叠放，悬停 / 聚焦 / 点击时一幕「像素马赛克」随机散入再散出，
// 期间把 firstContent 切到 secondContent，制造老式像素化转场。
// 瑚琏化：去 gsap，改 motion（m + LazyMotionProvider 减包）逐像素 staggered 关键帧动画；
// 像素色走 token（var(--color-foreground)）；reduced-motion 时直接切内容、不放像素动画（两态 DOM 一致，避 reveal 不可见坑）；
// 关键帧 hulian-pixel-transition 落 preset.css。

// 稳定 PRNG（mulberry32）：让每个像素的散场延迟在一次挂载内确定且可复现，避免 SSR/CSR 漂移。
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function PixelTransition({
  firstContent,
  secondContent,
  gridSize = 7,
  pixelColor = "var(--color-foreground)",
  animationStepDuration = 0.3,
  once = false,
  aspectRatio = "4 / 3",
  className,
  style,
  ...props
}: PixelTransitionProps) {
  const [active, setActive] = useState(false);
  // 「过场进行中」：用于触发像素动画的 key（每次切换 +1，重置每个像素的入场关键帧）。
  const [pass, setPass] = useState(0);
  const reduce = useReducedMotion();

  const total = Math.max(1, gridSize) * Math.max(1, gridSize);
  // 每像素一份 [0,1) 随机数 → 散场延迟比例；mulberry32 固定种子保证稳定。
  const delays = useMemo(() => {
    const rnd = mulberry32(0x9e3779b9 ^ total);
    return Array.from({ length: total }, () => rnd());
  }, [total]);

  const sizePct = 100 / Math.max(1, gridSize);

  const transition = useCallback((next: boolean) => {
    // 内容立即切换（aria 同步），像素幕布在 secondContent 之上散入再散出做转场。
    setActive(next);
    setPass((p) => p + 1);
  }, []);

  const enter = useCallback(() => {
    if (!active) transition(true);
  }, [active, transition]);
  const leave = useCallback(() => {
    if (active && !once) transition(false);
  }, [active, once, transition]);
  const toggle = useCallback(() => {
    if (!active) transition(true);
    else if (!once) transition(false);
  }, [active, once, transition]);

  const half = animationStepDuration / 2;

  return (
    <div
      {...props}
      data-active={active ? "" : undefined}
      tabIndex={0}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onFocus={enter}
      onBlur={leave}
      onClick={toggle}
      style={{ aspectRatio, ...style }}
      className={cn(
        "relative w-72 max-w-full overflow-hidden rounded-xl border border-border bg-surface text-foreground outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary/50",
        className,
      )}
    >
      <div className="absolute inset-0" aria-hidden={active}>
        {firstContent}
      </div>
      <div
        className={cn(
          "absolute inset-0 z-[2] transition-opacity duration-150",
          active ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!active}
      >
        {secondContent}
      </div>

      {/* 像素幕布：逐块随机 staggered 散入再散出 */}
      <div className="pointer-events-none absolute inset-0 z-[3]" aria-hidden>
        <LazyMotionProvider>
          {delays.map((d, i) => {
            const row = Math.floor(i / Math.max(1, gridSize));
            const col = i % Math.max(1, gridSize);
            const base: CSSProperties = {
              position: "absolute",
              top: `${row * sizePct}%`,
              left: `${col * sizePct}%`,
              width: `${sizePct}%`,
              height: `${sizePct}%`,
              backgroundColor: pixelColor,
            };
            // reduced-motion 或尚未交互（pass===0）：幕布常隐、不放动画，避免挂载即闪。
            if (reduce || pass === 0)
              return <span key={i} style={{ ...base, opacity: 0 }} />;
            return (
              <m.span
                key={`${pass}-${i}`}
                style={base}
                initial={{ opacity: 0 }}
                // 散入(0→1)再散出(1→0)；随机延迟铺在散入阶段，散出阶段错位收尾。
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: animationStepDuration,
                  times: [0, 0.45, 0.55, 1],
                  delay: d * half,
                  ease: "linear",
                }}
              />
            );
          })}
        </LazyMotionProvider>
      </div>
    </div>
  );
}
