"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import type { FitInput, FitScreenProps } from "./fit-screen.types";

// 大屏品类刚需：把固定设计尺寸(默认 1920×1080)等比缩放铺满父容器并居中。
// 几何全在纯函数 computeFit 里(可单测)；运行时只负责测量(ResizeObserver)+ 写 transform。
// transform: scale 下浏览器自动换算内部指针坐标，子元素点击/hover 不受影响。

/** 纯函数：由外层尺寸 + 设计尺寸 + 模式算缩放系数。SSR/测试安全。 */
export function computeFit({ outerW, outerH, designW, designH, mode }: FitInput): {
  scaleX: number;
  scaleY: number;
} {
  if (designW <= 0 || designH <= 0 || outerW <= 0 || outerH <= 0) {
    return { scaleX: 1, scaleY: 1 };
  }
  const sx = outerW / designW;
  const sy = outerH / designH;
  if (mode === "stretch") return { scaleX: sx, scaleY: sy };
  const s = mode === "cover" ? Math.max(sx, sy) : Math.min(sx, sy);
  return { scaleX: s, scaleY: s };
}

export function FitScreen({
  children,
  designWidth = 1920,
  designHeight = 1080,
  mode = "fit",
  className,
}: FitScreenProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scaleX: 1, scaleY: 1 });

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setFit(
        computeFit({
          outerW: r.width,
          outerH: r.height,
          designW: designWidth,
          designH: designHeight,
          mode,
        }),
      );
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [designWidth, designHeight, mode]);

  return (
    <div ref={outerRef} className={cn("relative h-full w-full overflow-hidden", className)}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: designWidth,
          height: designHeight,
          transform: `translate(-50%, -50%) scale(${fit.scaleX}, ${fit.scaleY})`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
