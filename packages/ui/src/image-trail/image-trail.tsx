"use client";
import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { ImageTrailProps } from "./image-trail.types";

// 吸取自 React Bits ImageTrail：光标拖动时沿轨迹依次甩出图片，每张从指针位置淡入、跟随插值移动、再缩小淡出，形成图像拖尾。
// 瑚琏化：去 gsap → 纯 requestAnimationFrame + lerp 自驱时间线（无运行时依赖）；token 化边框/底色（border-border/bg-surface）；
// "use client" + reduced-motion（useReducedMotion 关闭拖尾，DOM 两态一致不卸载内容）；指针事件统一 Pointer，触屏/鼠标同源。

const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

interface Slot {
  el: HTMLDivElement | null;
  /** 当前动画起始时间戳（ms），null=空闲 */
  startedAt: number | null;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export function ImageTrail({
  images,
  threshold = 80,
  imageWidth = 190,
  followStrength = 0.5,
  fadeDuration = 0.8,
  className,
  children,
  style,
  ...props
}: ImageTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Slot[]>([]);
  const reduce = useReducedMotion();

  // 指针状态（用 ref 避免高频 setState 抖动）
  const mouse = useRef({ x: 0, y: 0 });
  const cache = useRef({ x: 0, y: 0 });
  const last = useRef({ x: 0, y: 0 });
  const nextIndex = useRef(0);
  const started = useRef(false);

  const imageHeight = Math.round(imageWidth / 1.1);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouse.current = { x, y };
    if (!started.current) {
      started.current = true;
      cache.current = { x, y };
      last.current = { x, y };
    }
  }, []);

  useEffect(() => {
    if (reduce) return; // 减少动态偏好：不启动 RAF，保持 DOM 静止但完整
    if (images.length === 0) return;

    let raf = 0;
    const fadeMs = fadeDuration * 1000;

    const spawn = () => {
      const slot = slotRefs.current[nextIndex.current % slotRefs.current.length];
      nextIndex.current += 1;
      if (!slot || !slot.el) return;
      slot.startedAt = performance.now();
      slot.fromX = cache.current.x - imageWidth / 2;
      slot.fromY = cache.current.y - imageHeight / 2;
      slot.toX = mouse.current.x - imageWidth / 2;
      slot.toY = mouse.current.y - imageHeight / 2;
    };

    const render = (now: number) => {
      cache.current.x = lerp(cache.current.x, mouse.current.x, followStrength * 0.2);
      cache.current.y = lerp(cache.current.y, mouse.current.y, followStrength * 0.2);

      if (started.current) {
        const dx = mouse.current.x - last.current.x;
        const dy = mouse.current.y - last.current.y;
        if (Math.hypot(dx, dy) > threshold) {
          spawn();
          last.current = { ...mouse.current };
        }
      }

      // 每张图自驱时间线：前 40% 平移淡入(scale 1)，后 60% 缩小淡出
      for (const slot of slotRefs.current) {
        if (!slot.el) continue;
        if (slot.startedAt == null) {
          slot.el.style.opacity = "0";
          continue;
        }
        const t = Math.min(1, (now - slot.startedAt) / fadeMs);
        const moveP = Math.min(1, t / 0.4);
        const x = lerp(slot.fromX, slot.toX, moveP);
        const y = lerp(slot.fromY, slot.toY, moveP);
        const fade = t < 0.4 ? 1 : 1 - (t - 0.4) / 0.6;
        const scale = t < 0.4 ? 1 : lerp(1, 0.2, (t - 0.4) / 0.6);
        slot.el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
        slot.el.style.opacity = String(Math.max(0, fade));
        if (t >= 1) slot.startedAt = null;
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [reduce, images.length, threshold, imageWidth, imageHeight, followStrength, fadeDuration]);

  return (
    <div
      {...props}
      ref={containerRef}
      onPointerMove={onPointerMove}
      className={cn(
        "relative h-full w-full overflow-hidden rounded-xl border border-border bg-surface",
        className,
      )}
      style={style}
    >
      {images.map((src, i) => (
        <div
          key={i}
          ref={(el) => {
            slotRefs.current[i] = slotRefs.current[i] ?? {
              el: null,
              startedAt: null,
              fromX: 0,
              fromY: 0,
              toX: 0,
              toY: 0,
            };
            slotRefs.current[i].el = el;
          }}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 overflow-hidden rounded-2xl border border-border opacity-0 [will-change:transform,opacity] motion-reduce:hidden"
          style={
            {
              width: imageWidth,
              height: imageHeight,
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "50% 50%",
            } as CSSProperties
          }
        />
      ))}
      {children}
    </div>
  );
}
