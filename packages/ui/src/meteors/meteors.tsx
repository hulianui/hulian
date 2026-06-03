"use client";
import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { MeteorsProps } from "./meteors.types";

// 吸取自 magicui.design Meteors：N 颗随机延迟/时长的流星斜向下落 + 拖尾。
// 瑚琏化：流星头/尾用 currentColor（根 text-muted，可 className 覆盖，替 magicui 写死 zinc-500）；
// 随机位置在 useEffect 客户端生成避 hydration mismatch（left 用 % 容器相对）；关键帧 hulian-meteor 落 preset.css。
export function Meteors({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}: MeteorsProps) {
  const [styles, setStyles] = useState<CSSProperties[]>([]);

  useEffect(() => {
    setStyles(
      Array.from({ length: number }).map(
        () =>
          ({
            "--hulian-meteor-angle": `${-angle}deg`,
            top: "-5%",
            left: `${Math.floor(Math.random() * 100)}%`,
            animationDelay: `${Math.random() * (maxDelay - minDelay) + minDelay}s`,
            animationDuration: `${Math.floor(Math.random() * (maxDuration - minDuration) + minDuration)}s`,
          }) as CSSProperties,
      ),
    );
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle]);

  return (
    <>
      {styles.map((style, i) => (
        <span
          key={i}
          style={style}
          className={cn(
            "pointer-events-none absolute size-0.5 rounded-full bg-current text-muted shadow-[0_0_0_1px_rgba(255,255,255,0.1)]",
            "rotate-[var(--hulian-meteor-angle)] [animation:hulian-meteor_linear_infinite_backwards] motion-reduce:hidden",
            className,
          )}
        >
          {/* 拖尾 */}
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-[50px] -translate-y-1/2 bg-gradient-to-r from-current to-transparent" />
        </span>
      ))}
    </>
  );
}
