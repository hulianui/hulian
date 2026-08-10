"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { PixelCardProps, PixelCardVariant } from "./pixel-card.types";

// 吸取自 React Bits PixelCard：canvas2d 网格像素在悬停/聚焦时从中心向外波纹式生长，
// 长满后进入随机闪烁（shimmer），离开/失焦时逐格收缩消散。
//
// 瑚琏化要点：
// 1. 配色全吃瑚琏 token（默认 foreground / muted，自动明暗适配；变体走 chart-2/3/5），
//    替原版写死的 #f8fafc/#0ea5e9 等品牌 hex。
// 2. reducedMotion 用 motion/react 的 useReducedMotion()（替原版直接读 matchMedia），
//    命中时 speed→0、delay→0，像素仍渲染但不动（DOM 结构两态一致，绝不卸载内容）。
// 3. jsdom 安全：getContext 取不到（返回 null）时静默跳过初始化与动画，不抛错。
// 4. 零新依赖：纯 canvas2d + requestAnimationFrame，无 gsap / three。
// 5. "use client"——依赖 ref / effect / canvas，非 RSC。

interface VariantConfig {
  gap: number;
  speed: number;
  colors: string;
  noFocus: boolean;
}

// 配色走瑚琏 token（var(--color-…)），canvas fillStyle 喂 CSS 变量需带 --color- 前缀方可解析。
const VARIANTS: Record<PixelCardVariant, VariantConfig> = {
  default: {
    gap: 5,
    speed: 35,
    colors:
      "var(--color-foreground),var(--color-muted-foreground),var(--color-border)",
    noFocus: false,
  },
  blue: {
    gap: 8,
    speed: 25,
    colors:
      "var(--color-chart-2),var(--color-chart-1),var(--color-foreground)",
    noFocus: false,
  },
  pink: {
    gap: 6,
    speed: 80,
    colors:
      "var(--color-chart-5),var(--color-chart-4),var(--color-muted-foreground)",
    noFocus: true,
  },
  amber: {
    gap: 3,
    speed: 20,
    colors:
      "var(--color-chart-3),var(--color-chart-1),var(--color-muted-foreground)",
    noFocus: false,
  },
};

/** 把 0–100 标度的 speed 换算成每帧像素增量（与原版一致的节流系数）。 */
function getEffectiveSpeed(value: number, reducedMotion: boolean): number {
  const min = 0;
  const max = 100;
  const throttle = 0.001;
  const parsed = Math.trunc(value);
  if (parsed <= min || reducedMotion) return min;
  if (parsed >= max) return max * throttle;
  return parsed * throttle;
}

/** 单个像素：从 0 生长到 maxSize，长满后随机闪烁；收缩时逐帧缩回 0 转入 idle。 */
class Pixel {
  private ctx: CanvasRenderingContext2D;
  private x: number;
  private y: number;
  private color: string;
  private speed: number;
  private size = 0;
  private sizeStep: number;
  private minSize = 0.5;
  private maxSizeInteger = 2;
  private maxSize: number;
  private delay: number;
  private counter = 0;
  private counterStep: number;
  isIdle = false;
  private isReverse = false;
  private isShimmer = false;

  constructor(
    width: number,
    height: number,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    speed: number,
    delay: number,
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = rand(0.1, 0.9) * speed;
    this.sizeStep = Math.random() * 0.4;
    this.maxSize = rand(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counterStep = Math.random() * 4 + (width + height) * 0.01;
  }

  private draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size,
    );
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) this.isShimmer = true;
    if (this.isShimmer) this.shimmer();
    else this.size += this.sizeStep;
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    }
    this.size -= 0.1;
    this.draw();
  }

  private shimmer() {
    if (this.size >= this.maxSize) this.isReverse = true;
    else if (this.size <= this.minSize) this.isReverse = false;
    if (this.isReverse) this.size -= this.speed;
    else this.size += this.speed;
  }
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function PixelCard({
  variant = "default",
  gap,
  speed,
  colors,
  noFocus,
  className,
  children,
  style,
  ...props
}: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number | null>(null);
  const timePreviousRef = useRef(0);
  const prefersReduced = useReducedMotion();
  const reducedMotion = prefersReduced ?? false;

  const variantCfg = VARIANTS[variant] ?? VARIANTS.default;
  const finalGap = gap ?? variantCfg.gap;
  const finalSpeed = speed ?? variantCfg.speed;
  const finalColors = colors ? colors.join(",") : variantCfg.colors;
  const finalNoFocus = noFocus ?? variantCfg.noFocus;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    // jsdom / 不支持 canvas 的环境：getContext 返回 null，直接静默退出。
    const ctx = canvas.getContext?.("2d");
    if (!ctx) return;

    let pixels: Pixel[] = [];

    const initPixels = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      if (width === 0 || height === 0) return;

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const colorsArray = finalColors.split(",");
      const step = Math.max(1, Math.trunc(finalGap));
      const next: Pixel[] = [];
      const effSpeed = getEffectiveSpeed(finalSpeed, reducedMotion);
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          const color =
            colorsArray[Math.floor(Math.random() * colorsArray.length)] ??
            colorsArray[0]!;
          const dx = x - width / 2;
          const dy = y - height / 2;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const delay = reducedMotion ? 0 : distance;
          next.push(
            new Pixel(width, height, ctx, x, y, color, effSpeed, delay),
          );
        }
      }
      pixels = next;
      pixelsRef.current = next;
    };

    const doAnimate = (fnName: "appear" | "disappear") => {
      animationRef.current = requestAnimationFrame(() => doAnimate(fnName));
      const timeNow = performance.now();
      const timePassed = timeNow - timePreviousRef.current;
      const timeInterval = 1000 / 60;
      if (timePassed < timeInterval) return;
      timePreviousRef.current = timeNow - (timePassed % timeInterval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let allIdle = true;
      for (const pixel of pixels) {
        pixel[fnName]();
        if (!pixel.isIdle) allIdle = false;
      }
      if (allIdle && animationRef.current != null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };

    const handleAnimation = (name: "appear" | "disappear") => {
      if (animationRef.current != null) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(() => doAnimate(name));
    };

    const onEnter = () => handleAnimation("appear");
    const onLeave = () => handleAnimation("disappear");
    const onFocus = (e: FocusEvent) => {
      if (
        e.relatedTarget instanceof Node &&
        container.contains(e.relatedTarget)
      )
        return;
      handleAnimation("appear");
    };
    const onBlur = (e: FocusEvent) => {
      if (
        e.relatedTarget instanceof Node &&
        container.contains(e.relatedTarget)
      )
        return;
      handleAnimation("disappear");
    };

    initPixels();
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);
    if (!finalNoFocus) {
      container.addEventListener("focus", onFocus, true);
      container.addEventListener("blur", onBlur, true);
    }

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => initPixels())
        : null;
    observer?.observe(container);

    return () => {
      observer?.disconnect();
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
      container.removeEventListener("focus", onFocus, true);
      container.removeEventListener("blur", onBlur, true);
      if (animationRef.current != null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [finalGap, finalSpeed, finalColors, finalNoFocus, reducedMotion]);

  return (
    <div
      {...props}
      ref={containerRef}
      style={style}
      tabIndex={finalNoFocus ? -1 : 0}
      data-reduced-motion={reducedMotion ? "true" : undefined}
      className={cn(
        "relative isolate grid place-items-center overflow-hidden rounded-xl border border-border bg-surface",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
      />
      {children != null && <div className="relative z-10">{children}</div>}
    </div>
  );
}
