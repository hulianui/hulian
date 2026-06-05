"use client";
import {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { ScrambledTextProps } from "./scrambled-text.types";

// 吸取自 React Bits ScrambledText：指针靠近文字时，半径内的字符逐个翻滚乱码再收敛回原字（越近越久）。
// 瑚琏化：去 gsap/SplitText/ScrambleTextPlugin 三依赖，改纯 React 拆字 + 单条 requestAnimationFrame 调度；
// 配色走 token（text-foreground/font-mono），RSC 由 "use client" 隔离；reduced-motion 下 DOM 一致仅不触发翻滚。

/** 把 children 摊平成纯文本（仅取字符串/数字节点，避免破坏嵌套结构假设） */
function flatten(children: ReactNode): string {
  let out = "";
  Children.forEach(children, (child) => {
    if (typeof child === "string" || typeof child === "number") out += String(child);
  });
  return out;
}

interface CharState {
  /** 该字距收敛结束还剩多少帧权重（>0 表示正在翻滚） */
  remaining: number;
  /** 本次翻滚的总时长权重 */
  total: number;
}

export function ScrambledText({
  children,
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = ".:",
  className,
  style,
  ...props
}: ScrambledTextProps) {
  const reduce = useReducedMotion();
  const text = useMemo(() => flatten(children), [children]);
  const chars = useMemo(() => Array.from(text), [text]);

  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const stateRef = useRef<CharState[]>([]);
  const rafRef = useRef<number | null>(null);

  // 保持最新参数的 ref，供 RAF 闭包读取，避免重订阅 / 过期闭包
  const cfg = useRef({ radius, duration, speed, scrambleChars });
  cfg.current = { radius, duration, speed, scrambleChars };

  useEffect(() => {
    stateRef.current = chars.map(() => ({ remaining: 0, total: 0 }));
  }, [chars]);

  const tick = useCallback(() => {
    const { scrambleChars: pool, speed: spd } = cfg.current;
    let active = false;
    const states = stateRef.current;

    for (let i = 0; i < states.length; i++) {
      const st = states[i];
      const el = spanRefs.current[i];
      if (!el) continue;
      if (st.remaining > 0) {
        active = true;
        // 收敛系数：剩余越多越乱；speed 控制每帧推进步长
        const step = 1 + spd * 1.5;
        st.remaining = Math.max(0, st.remaining - step);
        if (st.remaining > 0 && pool.length > 0) {
          const original = chars[i] ?? "";
          el.textContent =
            original.trim() === ""
              ? original
              : pool[Math.floor(Math.random() * pool.length)]!;
        } else {
          el.textContent = chars[i] ?? "";
        }
      }
    }

    rafRef.current = active ? requestAnimationFrame(tick) : null;
  }, [chars]);

  const ensureLoop = useCallback(() => {
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const handleMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (reduce) return;
      const { radius: r, duration: dur } = cfg.current;
      const states = stateRef.current;
      for (let i = 0; i < spanRefs.current.length; i++) {
        const el = spanRefs.current[i];
        const st = states[i];
        if (!el || !st) continue;
        // jsdom 下 getBoundingClientRect 全 0，dist 恒 0 < r → 安全无害
        const { left, top, width, height } = el.getBoundingClientRect();
        const dx = e.clientX - (left + width / 2);
        const dy = e.clientY - (top + height / 2);
        const dist = Math.hypot(dx, dy);
        if (dist < r) {
          const weight = dur * 30 * (1 - dist / r); // 折算成「帧权重」（约 60fps 下）
          if (weight > st.remaining) {
            st.remaining = weight;
            st.total = weight;
          }
        }
      }
      ensureLoop();
    },
    [reduce, ensureLoop],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  return (
    <div
      {...props}
      onPointerMove={handleMove}
      style={style}
      className={cn(
        "max-w-2xl font-mono text-foreground [font-size:clamp(0.875rem,4vw,2rem)]",
        className,
      )}
    >
      <p aria-label={text}>
        {chars.map((ch, i) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            aria-hidden
            ref={(node) => {
              spanRefs.current[i] = node;
            }}
            className="inline-block [will-change:contents]"
          >
            {ch === " " ? " " : ch}
          </span>
        ))}
      </p>
    </div>
  );
}
