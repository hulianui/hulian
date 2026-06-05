"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { MagnetLinesProps } from "./magnet-lines.types";

// 吸取自 React Bits MagnetLines：rows×columns 的细长线段网格，每条线段像指南针一样
// 实时朝向鼠标指针（acos 反三角求角度），形成磁力线般的交互场。
//
// 瑚琏化要点：
// 1. 线色默认吃 token var(--color-foreground)（自动明暗适配，替原始写死的 #efefef）。
// 2. 去掉外部 .css 文件，grid / transform-origin / will-change 全内联，组件自包含。
// 3. reduced-motion：useReducedMotion() 为真时不挂 pointermove 监听、线段恒定 baseAngle，
//    DOM 结构两态完全一致（仅是否旋转的差异），无条件卸载内容。
// 4. 直接写 transform，不依赖关键帧（指针驱动，非时间驱动）；监听挂 window 但读取各线段
//    自身 getBoundingClientRect，StrictMode 双挂载安全（cleanup 移除监听）。
export function MagnetLines({
  rows = 9,
  columns = 9,
  containerSize = "80vmin",
  lineColor = "var(--color-foreground)",
  lineWidth = "1vmin",
  lineHeight = "6vmin",
  baseAngle = -10,
  className,
  style,
}: MagnetLinesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // reduced-motion：不挂监听，线段静止在 baseAngle。
    if (reduceMotion) return;
    const container = containerRef.current;
    if (!container) return;

    const items = container.querySelectorAll<HTMLSpanElement>("span");
    if (!items.length) return;

    const onPointerMove = (pointer: { x: number; y: number }) => {
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;

        const b = pointer.x - centerX;
        const a = pointer.y - centerY;
        const c = Math.sqrt(a * a + b * b) || 1;
        const r =
          ((Math.acos(b / c) * 180) / Math.PI) * (pointer.y > centerY ? 1 : -1);

        item.style.setProperty("--hulian-magnet-rotate", `${r}deg`);
      });
    };

    const handler = (e: PointerEvent) => onPointerMove({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", handler);

    return () => {
      window.removeEventListener("pointermove", handler);
    };
  }, [rows, columns, reduceMotion]);

  const total = rows * columns;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn("grid place-items-center", className)}
      style={
        {
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          width: containerSize,
          height: containerSize,
          ...style,
        } as CSSProperties
      }
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="block origin-center will-change-transform [transform:rotate(var(--hulian-magnet-rotate))]"
          style={
            {
              "--hulian-magnet-rotate": `${baseAngle}deg`,
              backgroundColor: lineColor,
              width: lineWidth,
              height: lineHeight,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
