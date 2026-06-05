"use client";

import { useCallback, useRef, type CSSProperties, type MouseEvent } from "react";
import { cn } from "../lib/cn";
import type { CardSpotlightProps } from "./card-spotlight.types";

/**
 * CardSpotlight — 鼠标跟随聚光卡片容器（来源：Aceternity UI card-spotlight，瑚琏化重写）。
 *
 * 实现策略：
 *  · 纯 CSS 变量驱动，无 framer-motion 依赖——比 useMotionValue 更轻，SSR 安全。
 *  · onMouseMove 把光标相对卡片的坐标写入 --hulian-spotlight-x / --hulian-spotlight-y，
 *    高光层用 radial-gradient(circle at var(--x) var(--y)) 实现跟随径向光晕。
 *  · onMouseEnter/Leave 切 --hulian-spotlight-opacity（带 transition 渐显/渐消）。
 *  · motion-reduce：opacity 过渡降级为立即显隐（transition-duration:0）。
 *  · 原版 Aceternity CanvasRevealEffect（WebGL 点阵）依赖 @react-three/fiber + three，
 *    体积重、SSR 危险——瑚琏化简化为可选 CSS 点阵背景（dotGrid prop 扩展预留，当前版本省略，
 *    保持组件零额外依赖）。
 */
export function CardSpotlight({
  radius = 350,
  color,
  className,
  children,
  style,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...props
}: CardSpotlightProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 默认高光色：chart-1 token 带 18% 透明度，与深色底色配合柔和不刺眼。
  // 消费者传 color 时直接用（支持不含透明度的颜色，外层将叠加到 0.18 opacity radial）。
  const resolvedColor = color ?? "var(--color-chart-1)";

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--hulian-spotlight-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--hulian-spotlight-y", `${e.clientY - rect.top}px`);
      el.style.setProperty("--hulian-spotlight-r", `${radius}px`);
      onMouseMove?.(e);
    },
    [radius, onMouseMove],
  );

  const handleMouseEnter = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      cardRef.current?.style.setProperty("--hulian-spotlight-opacity", "1");
      onMouseEnter?.(e);
    },
    [onMouseEnter],
  );

  const handleMouseLeave = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      cardRef.current?.style.setProperty("--hulian-spotlight-opacity", "0");
      onMouseLeave?.(e);
    },
    [onMouseLeave],
  );

  const mergedStyle = {
    // 初始值：光标在卡片中心，不透明度 0（高光未激活）
    "--hulian-spotlight-x": "50%",
    "--hulian-spotlight-y": "50%",
    "--hulian-spotlight-r": `${radius}px`,
    "--hulian-spotlight-opacity": "0",
    "--hulian-spotlight-color": resolvedColor,
    ...style,
  } as CSSProperties;

  return (
    <div
      ref={cardRef}
      style={mergedStyle}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        // 结构：relative + overflow-hidden 保证高光不溢出圆角
        "group relative overflow-hidden",
        // 卡片底色 + 边框 + 圆角 —— 吃 token，与 Card 保持一致
        "rounded-[var(--radius)] border border-border bg-surface text-foreground",
        // 内边距默认适中
        "p-6",
        className,
      )}
      {...props}
    >
      {/* 聚光高光层：绝对定位覆盖全卡片，pointer-events-none 不拦截子元素交互。
          radial-gradient 圆心跟随 CSS 变量；opacity 渐变过渡；
          motion-reduce 下 transition-duration 降为 0 立即切换。 */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 z-0",
          // opacity 过渡（渐入渐出）+ motion-reduce 降级
          "transition-opacity duration-300 motion-reduce:duration-0",
        )}
        style={{
          opacity: "var(--hulian-spotlight-opacity)",
          background: [
            // 主径向高光：color token 带低透明度，柔和光晕
            `radial-gradient(circle var(--hulian-spotlight-r) at var(--hulian-spotlight-x) var(--hulian-spotlight-y),`,
            `  color-mix(in srgb, var(--hulian-spotlight-color) 18%, transparent),`,
            `  transparent 80%`,
            `)`,
          ].join("\n"),
        }}
      />

      {/* 内容层：z-10 确保浮于高光层之上，保持正常交互 */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
