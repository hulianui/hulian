"use client";
import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { ClickSparkEasing, ClickSparkProps } from "./click-spark.types";

// 吸取自 React Bits ClickSpark：点击容器任意处，在点击点放射一圈短线段火花，
// 沿各自角度缓动飞出并随距离收短、duration 后消失（canvas2d + requestAnimationFrame 逐帧绘制）。
// 瑚琏化要点：
// 1. 颜色默认吃 --color-foreground token（自动明暗适配，替原始写死的 #fff）；canvas strokeStyle 走 var() 需带 --color- 前缀。
// 2. reduced-motion：useReducedMotion() 命中时不挂 RAF 也不入队火花，DOM 结构（容器 + canvas + children）跨两态完全一致。
// 3. jsdom 安全：getContext('2d') 返回 null 时直接跳过绘制，不抛错（测试环境无真实 canvas 上下文）。
// 4. RSC 边界：含 ref/effect/事件，标 "use client"；canvas 标 aria-hidden + pointer-events-none，不拦截子内容交互。
// 5. className / style / 其余 props 透传根容器；ResizeObserver 让 canvas 像素尺寸跟随父盒。

type Spark = {
  x: number;
  y: number;
  angle: number;
  startTime: number;
};

// canvas strokeStyle 不识别 var(...)，需把 token 解析为具体颜色（取自元素的 computed style）。
// jsdom 下 getComputedStyle 返回空串 → 回退原字符串，不抛错。
function resolveColor(raw: string, el: Element | null): string {
  const trimmed = raw.trim();
  const match = /^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)$/.exec(trimmed);
  if (!match || !el || typeof getComputedStyle === "undefined") return raw;
  const [, name, fallback] = match;
  const value = getComputedStyle(el).getPropertyValue(name).trim();
  return value || (fallback ? fallback.trim() : raw);
}

function ease(easing: ClickSparkEasing, t: number): number {
  switch (easing) {
    case "linear":
      return t;
    case "ease-in":
      return t * t;
    case "ease-in-out":
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case "ease-out":
    default:
      return t * (2 - t);
  }
}

export function ClickSpark({
  sparkColor = "var(--color-foreground)",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = "ease-out",
  extraScale = 1,
  className,
  style,
  children,
  ...props
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<Spark[]>([]);
  const reduceMotion = useReducedMotion();

  // 最新参数以 ref 暴露给 RAF 循环，避免每次参数变化重启动画导致已有火花断裂。
  const optsRef = useRef({ sparkColor, sparkSize, sparkRadius, duration, easing, extraScale });
  optsRef.current = { sparkColor, sparkSize, sparkRadius, duration, easing, extraScale };

  // canvas 像素尺寸跟随父盒（ResizeObserver + 初次同步）。
  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    let resizeTimeout: ReturnType<typeof setTimeout> | undefined;
    const resize = () => {
      const { width, height } = parent.getBoundingClientRect();
      if (canvas.width !== Math.round(width) || canvas.height !== Math.round(height)) {
        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
      }
    };
    const onResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resize, 100);
    };

    resize();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(onResize);
    ro.observe(parent);
    return () => {
      ro.disconnect();
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, []);

  // RAF 绘制循环：reduced-motion 命中时不启动（无火花，亦不耗帧）。
  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // jsdom / 无 2d 上下文时安全退出

    let raf = 0;
    const draw = (timestamp: number) => {
      const { sparkColor: color, sparkSize: size, sparkRadius: radius, duration: dur, easing: ez, extraScale: scale } =
        optsRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = resolveColor(color, canvas);
      ctx.lineWidth = 2;

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= dur) return false;

        const eased = ease(ez, elapsed / dur);
        const distance = eased * radius * scale;
        const lineLength = size * (1 - eased);
        const cos = Math.cos(spark.angle);
        const sin = Math.sin(spark.angle);
        const x1 = spark.x + distance * cos;
        const y1 = spark.y + distance * sin;
        const x2 = spark.x + (distance + lineLength) * cos;
        const y2 = spark.y + (distance + lineLength) * sin;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return true;
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      const count = Math.max(1, sparkCount);
      for (let i = 0; i < count; i++) {
        sparksRef.current.push({
          x,
          y,
          angle: (2 * Math.PI * i) / count,
          startTime: now,
        });
      }
    },
    [reduceMotion, sparkCount],
  );

  return (
    <div
      {...props}
      onClick={handleClick}
      className={cn("relative h-full w-full", className)}
      style={style}
    >
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 block h-full w-full select-none"
      />
      {children}
    </div>
  );
}
