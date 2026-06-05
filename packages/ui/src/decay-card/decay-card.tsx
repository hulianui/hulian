"use client";
import { useEffect, useId, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import type { DecayCardProps } from "./decay-card.types";

// 吸取自 React Bits DecayCard：SVG feTurbulence + feDisplacementMap 把主图做成「湍流溶解」——
// 鼠标越快划过，位移 scale 越大、图像越像被融化/抽丝；同时整卡随鼠标做带阻尼的视差倾斜平移。
//
// 瑚琏化要点：
// 1. 去 gsap 依赖：用裸 requestAnimationFrame + lerp 缓动驱动 transform 与 filter scale 属性，
//    直接写 DOM ref，零运行时新增依赖。
// 2. RSC 安全的客户端组件（"use client" + useEffect 监听 window）；SSR/jsdom 下不依赖 canvas/WebGL，
//    SVG 滤镜即便不计算也不会抛错（getContext 无关）。
// 3. reduced-motion：useReducedMotion() 命中即不挂 RAF/监听，卡片保持静态（DOM 结构两态一致，
//    图片与文字始终在位，仅停掉鼠标驱动的位移与溶解）。
// 4. token 化：底色 bg-surface、边框 border-border、文字 text-foreground，圆角吃 rounded-xl；
//    无品牌写死色。
// 5. filter id 用 useId() 去前缀冒号，避免同页多实例 id 撞车。
export function DecayCard({
  width = 300,
  height = 400,
  image = "https://picsum.photos/300/400?grayscale",
  alt = "",
  baseFrequency = 0.015,
  numOctaves = 5,
  seed = 4,
  maxDisplacement = 400,
  movementBound = 50,
  children,
  className,
  style,
}: DecayCardProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);
  const reduceMotion = useReducedMotion();

  // filter id 去掉 useId 产生的冒号（CSS url() 不接受冒号）
  const filterId = `hulian-decay-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    if (reduceMotion) return;
    if (typeof window === "undefined") return;

    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;
    const map = (x: number, a: number, b: number, c: number, d: number) =>
      ((x - a) * (d - c)) / (b - a) + c;
    const dist = (x1: number, x2: number, y1: number, y2: number) =>
      Math.hypot(x1 - x2, y1 - y2);

    let win = { w: window.innerWidth, h: window.innerHeight };
    let cursor = { x: win.w / 2, y: win.h / 2 };
    let cached = { ...cursor };
    const t = { x: 0, y: 0, rz: 0 };
    let scale = 0;

    const onResize = () => {
      win = { w: window.innerWidth, h: window.innerHeight };
    };
    const onMove = (e: MouseEvent) => {
      cursor = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);

    let rafId = 0;
    const render = () => {
      let tx = lerp(t.x, map(cursor.x, 0, win.w, -120, 120), 0.1);
      let ty = lerp(t.y, map(cursor.y, 0, win.h, -120, 120), 0.1);
      const trz = lerp(t.rz, map(cursor.x, 0, win.w, -10, 10), 0.1);

      // 软边界阻尼：越界后按 0.2 系数继续，形成弹性拉到头手感
      if (tx > movementBound) tx = movementBound + (tx - movementBound) * 0.2;
      if (tx < -movementBound) tx = -movementBound + (tx + movementBound) * 0.2;
      if (ty > movementBound) ty = movementBound + (ty - movementBound) * 0.2;
      if (ty < -movementBound) ty = -movementBound + (ty + movementBound) * 0.2;

      t.x = tx;
      t.y = ty;
      t.rz = trz;

      if (rootRef.current) {
        rootRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${trz}deg)`;
      }

      // 位移 scale 跟随鼠标瞬时位移：移动越快越溶解，停下回落
      const travelled = dist(cached.x, cursor.x, cached.y, cursor.y);
      scale = lerp(scale, map(travelled, 0, 200, 0, maxDisplacement), 0.06);
      if (dispRef.current) {
        dispRef.current.setAttribute("scale", String(scale));
      }
      cached = { ...cursor };

      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [maxDisplacement, movementBound, reduceMotion]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-surface will-change-transform",
        className,
      )}
      style={{ width, height, ...style }}
    >
      <svg
        viewBox="-60 -75 720 900"
        preserveAspectRatio="xMidYMid slice"
        className="block h-full w-full"
        aria-hidden={alt === "" ? true : undefined}
      >
        <filter id={filterId}>
          <feTurbulence
            type="turbulence"
            baseFrequency={baseFrequency}
            numOctaves={numOctaves}
            seed={seed}
            stitchTiles="stitch"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            result="turbulence1"
          />
          <feDisplacementMap
            ref={dispRef}
            in="SourceGraphic"
            in2="turbulence1"
            scale="0"
            xChannelSelector="R"
            yChannelSelector="B"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
            result="displaced"
          />
        </filter>
        <g>
          <image
            href={image}
            x="0"
            y="0"
            width="600"
            height="750"
            filter={`url(#${filterId})`}
            preserveAspectRatio="xMidYMid slice"
          >
            {alt ? <title>{alt}</title> : null}
          </image>
        </g>
      </svg>
      {children != null && (
        <div className="pointer-events-none absolute bottom-5 left-4 z-10 text-3xl font-black leading-tight tracking-tight text-foreground">
          {children}
        </div>
      )}
    </div>
  );
}
