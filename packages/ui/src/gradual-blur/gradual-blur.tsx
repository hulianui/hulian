"use client";
import { useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type {
  GradualBlurCurve,
  GradualBlurPosition,
  GradualBlurProps,
} from "./gradual-blur.types";

// 吸取自 React Bits GradualBlur：沿容器某一边叠加 N 层 backdrop-filter blur，
// 每层用 linear-gradient 的 mask-image 错位切片，使模糊量从边缘向内逐级递增，
// 形成"渐进式"柔化贴边（比单层 backdrop-blur 过渡自然得多）。
//
// 瑚琏化要点：
// 1. 去掉原版 document.createElement('style') 运行时注入全局样式的副作用 —— 改为
//    Tailwind 工具类 + 内联样式，SSR 安全、不污染全局。
// 2. 去掉 React.memo / PRESETS / CURVE_FUNCTIONS 静态挂载 —— 预设交由调用方组合，
//    保持组件纯净；曲线作为受控 prop。
// 3. reduced-motion：用 useReducedMotion() 网关，关闭悬停/进场过渡（动画相关），
//    但 DOM 与模糊层结构两态完全一致，仅去掉 transition。
// 4. revealOnScroll 用 motion 的 useInView（替原版手搓 IntersectionObserver），
//    jsdom 下安全降级（无 IO 时视为可见）。
// 5. 模糊层强度纯算法推导，无写死颜色；mask 用 black/transparent（中性，吃任意底）。

const CURVE_FUNCTIONS: Record<GradualBlurCurve, (p: number) => number> = {
  linear: (p) => p,
  bezier: (p) => p * p * (3 - 2 * p),
  "ease-in": (p) => p * p,
  "ease-out": (p) => 1 - Math.pow(1 - p, 2),
  "ease-in-out": (p) =>
    p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2,
};

const GRADIENT_DIRECTION: Record<GradualBlurPosition, string> = {
  top: "to top",
  bottom: "to bottom",
  left: "to left",
  right: "to right",
};

export function GradualBlur({
  position = "bottom",
  strength = 2,
  height = "6rem",
  width,
  divCount = 5,
  exponential = false,
  curve = "linear",
  opacity = 1,
  hoverIntensity,
  revealOnScroll = false,
  duration = "0.3s",
  zIndex = 10,
  className,
  style,
  children,
}: GradualBlurProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const reduceMotion = useReducedMotion();

  // useInView：未开启 revealOnScroll 时 once=true 且不观察 → 始终视为可见。
  // jsdom 无 IntersectionObserver 时 motion 内部安全降级，不抛错。
  const inView = useInView(containerRef, { once: true, amount: 0.1 });
  const isVisible = revealOnScroll ? inView : true;

  const count = Math.max(1, Math.floor(divCount));

  const blurDivs = useMemo(() => {
    const increment = 100 / count;
    const currentStrength =
      isHovered && hoverIntensity ? strength * hoverIntensity : strength;
    const curveFunc = CURVE_FUNCTIONS[curve] ?? CURVE_FUNCTIONS.linear;
    const direction = GRADIENT_DIRECTION[position] ?? "to bottom";

    return Array.from({ length: count }, (_, idx) => {
      const i = idx + 1;
      const progress = curveFunc(i / count);

      const blurValue = exponential
        ? Math.pow(2, progress * 4) * 0.0625 * currentStrength
        : 0.0625 * (progress * count + 1) * currentStrength;

      const p1 = Math.round((increment * i - increment) * 10) / 10;
      const p2 = Math.round(increment * i * 10) / 10;
      const p3 = Math.round((increment * i + increment) * 10) / 10;
      const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

      let gradient = `transparent ${p1}%, black ${p2}%`;
      if (p3 <= 100) gradient += `, black ${p3}%`;
      if (p4 <= 100) gradient += `, transparent ${p4}%`;

      const mask = `linear-gradient(${direction}, ${gradient})`;
      const blur = `blur(${blurValue.toFixed(3)}rem)`;

      const divStyle: CSSProperties = {
        position: "absolute",
        inset: 0,
        maskImage: mask,
        WebkitMaskImage: mask,
        backdropFilter: blur,
        WebkitBackdropFilter: blur,
        opacity,
        // 悬停增强时让 backdrop-filter 平滑过渡；reduced-motion 下取消
        transition:
          hoverIntensity && !reduceMotion
            ? `backdrop-filter ${duration} ease-out`
            : undefined,
      };

      return <div key={i} style={divStyle} aria-hidden />;
    });
  }, [
    count,
    isHovered,
    hoverIntensity,
    strength,
    curve,
    position,
    exponential,
    opacity,
    duration,
    reduceMotion,
  ]);

  const containerStyle = useMemo<CSSProperties>(() => {
    const isVertical = position === "top" || position === "bottom";

    const base: CSSProperties = {
      position: "absolute",
      pointerEvents: hoverIntensity ? "auto" : "none",
      opacity: isVisible ? 1 : 0,
      transition:
        revealOnScroll && !reduceMotion
          ? `opacity ${duration} ease-out`
          : undefined,
      zIndex,
      isolation: "isolate",
      ...style,
    };

    if (isVertical) {
      base.height = height;
      base.width = "100%";
      base.left = 0;
      base.right = 0;
      base[position] = 0;
    } else {
      base.width = width ?? height;
      base.height = "100%";
      base.top = 0;
      base.bottom = 0;
      base[position] = 0;
    }

    return base;
  }, [
    position,
    hoverIntensity,
    isVisible,
    revealOnScroll,
    reduceMotion,
    duration,
    zIndex,
    height,
    width,
    style,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("overflow-hidden", className)}
      style={containerStyle}
      onMouseEnter={hoverIntensity ? () => setIsHovered(true) : undefined}
      onMouseLeave={hoverIntensity ? () => setIsHovered(false) : undefined}
    >
      <div className="pointer-events-none relative h-full w-full">
        {blurDivs}
      </div>
      {children != null && (
        <div className="relative z-10 h-full w-full">{children}</div>
      )}
    </div>
  );
}
