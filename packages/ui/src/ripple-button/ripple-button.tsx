"use client";
import { useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { cn } from "../lib/cn";
import type { RippleButtonProps } from "./ripple-button.types";

// 吸取自 magicui.design Ripple Button：点击落点扩散水波纹（Material 风），动画结束自移除。
// 瑚琏化：底色 primary、波纹默认 primary-foreground；关键帧 hulian-button-ripple 落 preset.css；
// reduced-motion 下波纹 hidden（无意义动画直接不显）。状态驱动 → 必 "use client"。
// 关键：波纹 span 基础样式必须内联 transform: scale(0) —— 共享关键帧只有 to { scale(4); opacity: 0 }，
// 隐式 from 取元素当前样式；缺 scale(0) 时波纹出生即整钮大小的均匀白罩（无扩散边缘），视觉上等于"没有波纹"。
// 不可用 Tailwind 的 scale-0 类：v4 下它是独立 scale 属性，与关键帧的 transform 相乘 → 全程不可见。
interface Ripple {
  key: number;
  x: number;
  y: number;
  size: number;
}

export function RippleButton({
  rippleColor = "var(--color-primary-foreground)",
  duration = "600ms",
  className,
  children,
  onClick,
  style,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const seq = useRef(0);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    // 键盘激活 / 程序化 click() 没有真实坐标（detail === 0），波纹从按钮中心扩散而非左上角外。
    const cx = e.detail === 0 ? rect.width / 2 : e.clientX - rect.left;
    const cy = e.detail === 0 ? rect.height / 2 : e.clientY - rect.top;
    setRipples((prev) => [...prev, { key: seq.current++, size, x: cx - size / 2, y: cy - size / 2 }]);
    onClick?.(e);
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      style={{ "--hulian-ripple-duration": duration, ...style } as CSSProperties}
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-[var(--radius)] bg-primary px-6 py-3 font-medium text-primary-foreground",
        "transition-transform duration-200 active:translate-y-px",
        className,
      )}
    >
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute inset-0">
        {ripples.map((r) => (
          <span
            key={r.key}
            className="absolute rounded-full opacity-50 [animation:hulian-button-ripple_var(--hulian-ripple-duration,600ms)_ease-out] motion-reduce:hidden"
            style={{ width: r.size, height: r.size, left: r.x, top: r.y, background: rippleColor, transform: "scale(0)" }}
            onAnimationEnd={() => setRipples((prev) => prev.filter((p) => p.key !== r.key))}
          />
        ))}
      </span>
    </button>
  );
}
