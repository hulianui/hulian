import { Children, type CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { OrbitingCirclesProps } from "./orbiting-circles.types";

// 吸取自 magicui.design OrbitingCircles：子元素沿圆周匀速环绕（可 RSC，纯 CSS）。
// 瑚琏化：轨道虚线圆 stroke=currentColor(根 text-border)；关键帧 hulian-orbit 落 preset.css，
// 子元素自身反旋抵消公转 → 图标保持正立；motion-reduce 静止散布在圆周（不旋转）。
export function OrbitingCircles({
  children,
  radius = 150,
  duration = 20,
  reverse = false,
  iconSize = 40,
  showPath = true,
  className,
}: OrbitingCirclesProps) {
  const items = Children.toArray(children);
  const count = items.length || 1;

  return (
    <>
      {showPath && (
        <svg className="pointer-events-none absolute inset-0 size-full text-border" aria-hidden>
          <circle
            className="stroke-current"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
        </svg>
      )}
      {items.map((child, i) => {
        const angle = (360 / count) * i;
        return (
          <div
            key={i}
            aria-hidden
            style={
              {
                "--hulian-orbit-radius": radius,
                "--hulian-orbit-angle": angle,
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                animationDuration: `${duration}s`,
                animationDirection: reverse ? "reverse" : "normal",
              } as CSSProperties
            }
            className={cn(
              "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",
              "[animation:hulian-orbit_linear_infinite] motion-reduce:[animation:none]",
              className,
            )}
          >
            {child}
          </div>
        );
      })}
    </>
  );
}
