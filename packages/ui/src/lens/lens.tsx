"use client";
import { useRef, useState, type CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { LensProps } from "./lens.types";

// 吸取自 magicui.design Lens：悬停时在光标处显示圆形放大镜（含状态/指针跟随故 "use client"）。
// 瑚琏化：对任意 children 生效——叠一层 children 副本，圆形 mask 跟随光标 + transform-origin 设在
// 光标点做 scale 放大（光标下的点保持对齐）。零依赖、无新 token。
export function Lens({ children, zoom = 1.6, size = 140, className }: LensProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const mask = pos
    ? `radial-gradient(circle ${size / 2}px at ${pos.x}px ${pos.y}px, black 0, black 99%, transparent 100%)`
    : "none";

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos(null)}
      className={cn("relative overflow-hidden", className)}
    >
      {children}
      {pos && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={
            {
              maskImage: mask,
              WebkitMaskImage: mask,
              transform: `scale(${zoom})`,
              transformOrigin: `${pos.x}px ${pos.y}px`,
            } as CSSProperties
          }
        >
          {children}
        </div>
      )}
    </div>
  );
}
