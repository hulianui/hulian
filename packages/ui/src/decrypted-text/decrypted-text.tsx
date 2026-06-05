"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { DecryptedTextProps } from "./decrypted-text.types";

// 吸取自 reactbits.dev Decrypted Text：字符乱码翻滚后逐位解码到明文。
// 瑚琏化：随机只在客户端 effect 里发生（state 存最终 display），SSR 渲染明文 → 零 hydration mismatch；
// 整段 aria-label 明文、可见乱码 aria-hidden（读屏读明文）；reduced-motion → 直接明文。
// 触发：view 滚入一次性解码 / hover 悬停解码、移出复位为乱码。
const DEFAULT_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export function DecryptedText({
  text,
  speed = 55,
  animateOn = "view",
  characters = DEFAULT_CHARS,
  className,
  ...props
}: DecryptedTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduce = useReducedMotion();
  const [active, setActive] = useState(false);
  // SSR 初值为明文 → 服务端/首帧确定，规避 hydration mismatch；随机仅发生在下方 effect。
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const pool = characters.length > 0 ? characters : DEFAULT_CHARS;
    const chars = Array.from(text);
    const scramble = (revealCount: number) =>
      chars
        .map((ch, i) =>
          /\s/.test(ch)
            ? ch
            : i < revealCount
              ? ch
              : pool[Math.floor(Math.random() * pool.length)],
        )
        .join("");

    if (reduce) {
      setDisplay(text);
      return;
    }
    const shouldRun = animateOn === "hover" ? active : inView;
    if (!shouldRun) {
      // 静息：乱码态（hover 移出 / view 未进入视口）
      setDisplay(scramble(0));
      return;
    }
    let r = 0;
    setDisplay(scramble(0));
    const id = setInterval(() => {
      r += 1;
      setDisplay(scramble(r));
      if (r >= chars.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [active, inView, reduce, text, speed, animateOn, characters]);

  const hoverHandlers =
    animateOn === "hover"
      ? {
          onMouseEnter: () => setActive(true),
          onMouseLeave: () => setActive(false),
        }
      : {};

  return (
    <span
      ref={ref}
      aria-label={text}
      className={cn("inline-block whitespace-pre-wrap font-mono tabular-nums", className)}
      {...hoverHandlers}
      {...props}
    >
      <span aria-hidden>{display}</span>
    </span>
  );
}
