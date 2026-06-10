"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/cn";
import { fitToContainer, stepPhysics } from "./ballpit.physics";
import type { BallpitProps } from "./ballpit.types";

// 吸取自 React Bits Ballpit：一坑彩色小球受重力下落、撞墙回弹、彼此挤碰，
// 光标化作一颗"排斥球"把周围小球推开 —— 一个可交互的实体球池。
//
// 瑚琏化要点：
// 1. 去依赖：原版用 three.js（InstancedMesh + MeshPhysicalMaterial + RoomEnvironment + 3D 物理 +
//    Raycaster 光标平面求交），全部禁用。改用零依赖 canvas2d 重新构想为 2D 球池物理
//    （重力 / 墙壁回弹 / 球球弹性碰撞 / 光标排斥），效果同源、体量极轻。
// 2. 颜色全吃 chart token（默认 chart-1..5），挂载时从计算样式解析当前主题色，明暗自适应。
// 3. RSC：canvas 物理需 effect/ref，标 "use client"；纯装饰 aria-hidden、pointer-events-none。
// 4. reduced-motion：useReducedMotion 不可用于"读后再决定建不建循环"——这里用 matchMedia 探测，
//    reduced=true 时不启动 RAF 物理，渲染静态小球占位（DOM 仍在，不卸载内容）。
// 5. canvas getContext 为 null（jsdom / 无 2D 支持）时静默降级，绝不抛错。
// 6. 容器自适应（治窄卡抖动）：物理与容量约束抽到 ballpit.physics.ts 纯函数 ——
//    球数/半径随容器面积自适应（球总面积 ≤ 容器 MAX_FILL），初始与每次 resize 都重约束；
//    重叠分离只做位置校正（松弛 + slop），低速碰撞非弹性 + 触底静置，堆积可真正收敛。

const DEFAULT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  /** 半径单位样本 [0,1]：容器变化时按当前 fit 的 [rMin, rMax] 重映射，保持相对大小 */
  u: number;
  color: string;
}

// 把任意 CSS 颜色（含 var(--…) 计算后值）解析为可直接喂 canvas fillStyle 的色串。
// var(--color-chart-N) 在 fillStyle 里不解析，需先经 getComputedStyle 求值。
function resolveColors(host: HTMLElement, colors: string[]): string[] {
  const cs = getComputedStyle(host);
  return colors.map((c) => {
    const m = /^var\((--[\w-]+)\)$/.exec(c.trim());
    if (m) {
      const v = cs.getPropertyValue(m[1]!).trim();
      return v || "#888";
    }
    return c;
  });
}

export function Ballpit({
  count = 80,
  colors = DEFAULT_COLORS,
  gravity = 900,
  bounce = 0.86,
  sizeRange = [10, 26],
  followCursor = true,
  fallback,
  className,
  style,
}: BallpitProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [reduced, setReduced] = useState(false);

  // 客户端探测 reduced-motion（SSR 恒 false，避免 hydration mismatch）
  useEffect(() => {
    setReduced(
      typeof window !== "undefined" &&
        (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false),
    );
  }, []);

  useEffect(() => {
    if (reduced) return; // 降级：渲染静态占位，不建物理循环
    const host = hostRef.current;
    if (!host) return;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.touchAction = "none";
    host.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      // jsdom / 无 2D 支持 → 静默降级，容器留空
      canvas.remove();
      return;
    }

    const palette = resolveColors(host, colors.length ? colors : DEFAULT_COLORS);
    const dpr = Math.min(
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
      2,
    );
    const [minR, maxR] = sizeRange;
    const rMin = Math.min(minR, maxR);
    const rMax = Math.max(minR, maxR);

    let w = host.clientWidth || 1;
    let h = host.clientHeight || 1;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    // 球池：先建满额"候选球"（只定相对大小与颜色），实际激活多少由容器面积决定
    const total = Math.max(0, Math.floor(count));
    const balls: Ball[] = Array.from({ length: total }, (_, i) => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 0,
      u: Math.random(),
      color: palette[i % palette.length] ?? "#888",
    }));
    let active: Ball[] = [];

    // 按当前容器尺寸重约束：半径/数量随面积自适应（初始与每次 resize 都走这里）
    const applyFit = () => {
      const fit = fitToContainer(total, rMin, rMax, w, h);
      for (const b of balls) b.r = fit.rMin + b.u * (fit.rMax - fit.rMin);
      // 新激活的球（初始 / 容器变大）随机落位
      for (let i = active.length; i < fit.count; i++) {
        const b = balls[i]!;
        b.x = rand(b.r, Math.max(b.r, w - b.r));
        b.y = rand(b.r, Math.max(b.r, h - b.r));
        b.vx = rand(-60, 60);
        b.vy = rand(-60, 60);
      }
      active = balls.slice(0, fit.count);
      // 已有球 clamp 回新边界（只动位置，不注速度）
      for (const b of active) {
        b.x = Math.min(Math.max(b.x, b.r), Math.max(b.r, w - b.r));
        b.y = Math.min(Math.max(b.y, b.r), Math.max(b.r, h - b.r));
      }
    };

    // 光标排斥球（容器内移动时激活）
    const pointer = { x: -1e4, y: -1e4, active: false };
    const POINTER_R = 60;

    const onMove = (e: PointerEvent) => {
      if (!followCursor) return;
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    if (followCursor) {
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerleave", onLeave);
    }

    const setSize = () => {
      w = host.clientWidth || 1;
      h = host.clientHeight || 1;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      applyFit(); // 响应式宽度变化时重新约束球数/半径
    };
    setSize();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(setSize);
      ro.observe(host);
    }

    let visible = true;
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      });
      io.observe(host);
    }

    let raf = 0;
    let last = 0;
    let errored = false;

    const step = (t: number) => {
      raf = requestAnimationFrame(step); // 先排下一帧：单帧抛错不杀循环
      if (errored) return;
      try {
        const dt = last ? Math.min((t - last) / 1000, 0.033) : 0.016;
        last = t;
        if (!visible) return;

        // 物理推进（纯函数：重力/墙壁/位置校正碰撞/速度上限/低速收敛，见 ballpit.physics.ts）
        stepPhysics(active, {
          dt,
          w,
          h,
          gravity,
          bounce,
          pointer:
            followCursor && pointer.active
              ? { x: pointer.x, y: pointer.y, r: POINTER_R, strength: 1400 }
              : null,
        });

        // 绘制
        ctx.clearRect(0, 0, w, h);
        for (const b of active) {
          // 轻微高光：径向渐变模拟球面光泽
          const grad = ctx.createRadialGradient(
            b.x - b.r * 0.35,
            b.y - b.r * 0.35,
            b.r * 0.1,
            b.x,
            b.y,
            b.r,
          );
          grad.addColorStop(0, "rgba(255,255,255,0.45)");
          grad.addColorStop(0.25, b.color);
          grad.addColorStop(1, b.color);
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      } catch {
        errored = true; // 持续抛错 → 停渲染，不崩页面
      }
    };
    raf = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      if (followCursor) {
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerleave", onLeave);
      }
      canvas.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, count, gravity, bounce, followCursor]);

  // reduced-motion / 降级：静态小球占位（DOM 不卸载，只是不动）
  if (reduced) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-0 overflow-hidden",
          className,
        )}
        style={style}
        aria-hidden
      >
        {fallback ?? (
          <div className="flex h-full w-full flex-wrap content-end gap-2 p-4 opacity-80">
            {Array.from({ length: 18 }, (_, i) => (
              <span
                key={i}
                className="block rounded-full"
                style={{
                  width: 16 + (i % 4) * 6,
                  height: 16 + (i % 4) * 6,
                  background: DEFAULT_COLORS[i % DEFAULT_COLORS.length],
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={hostRef}
      className={cn(
        "absolute inset-0 z-0 block h-full w-full overflow-hidden",
        followCursor ? "pointer-events-auto" : "pointer-events-none",
        className,
      )}
      style={style}
      aria-hidden
    />
  );
}
