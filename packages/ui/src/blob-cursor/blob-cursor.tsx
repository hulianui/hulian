"use client";
import { useCallback, useId, useRef } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { BlobCursorProps } from "./blob-cursor.types";

// 吸取自 React Bits BlobCursor：领头水滴跟手 + 多个拖尾水滴弹性追随，经 SVG gooey
// （高斯模糊 + feColorMatrix 提对比）滤镜把相邻水滴融成液态水银的「果冻光标」。
// 瑚琏化：
// 1. 去 gsap 依赖——改用 motion 的 useSpring（领头高刚度跟手、拖尾低刚度拖泥带水），
//    每滴一对 MotionValue(x/y)，串联追随上一滴，零外部时间线库。
// 2. 颜色吃 token：主体 var(--color-primary)、高光 var(--color-primary-foreground)，自动明暗适配。
// 3. reduced-motion：useReducedMotion 时关弹簧（水滴瞬移跟手），DOM 两态一致不增删节点。
// 4. pointer 事件统一走 onPointerMove（鼠标 / 触摸 / 触控笔通吃），水滴层 pointer-events:none 不挡交互。
// 5. gooey 滤镜 id 用 useId 隔离，避免多实例 SVG filter 撞 id。

const DEFAULT_SIZES = [56, 116, 72];
const DEFAULT_INNER_SIZES = [18, 32, 22];

/** 取数组第 i 项，越界则循环复用，再越界回退 fallback */
function pick(arr: number[], i: number, fallback: number): number {
  if (arr.length === 0) return fallback;
  return arr[i % arr.length] ?? fallback;
}

/** 单个水滴：自带一对弹簧 MotionValue，串联追随目标 x/y */
function Blob({
  size,
  innerSize,
  fillColor,
  innerColor,
  square,
  stiffness,
  damping,
  reduce,
  targetX,
  targetY,
}: {
  size: number;
  innerSize: number;
  fillColor: string;
  innerColor: string;
  square: boolean;
  stiffness: number;
  damping: number;
  reduce: boolean;
  targetX: ReturnType<typeof useMotionValue<number>>;
  targetY: ReturnType<typeof useMotionValue<number>>;
}) {
  // reduced-motion：极高刚度 + 零阻尼近似瞬移；否则按传入弹簧参数拖随。
  const spring = reduce
    ? { stiffness: 100000, damping: 1 }
    : { stiffness, damping };
  const x = useSpring(targetX, spring);
  const y = useSpring(targetY, spring);
  const radius = square ? "20%" : "50%";

  return (
    <m.div
      aria-hidden
      className="absolute left-0 top-0 will-change-transform"
      style={{
        x,
        y,
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderRadius: radius,
        backgroundColor: fillColor,
      }}
    >
      <span
        className="absolute"
        style={{
          width: innerSize,
          height: innerSize,
          top: (size - innerSize) / 2,
          left: (size - innerSize) / 2,
          borderRadius: radius,
          backgroundColor: innerColor,
        }}
      />
    </m.div>
  );
}

export function BlobCursor({
  trailCount = 3,
  sizes = DEFAULT_SIZES,
  innerSizes = DEFAULT_INNER_SIZES,
  fillColor = "var(--color-primary)",
  innerColor = "var(--color-primary-foreground)",
  square = false,
  gooey = true,
  gooeyStrength = 16,
  leadStiffness = 500,
  trailStiffness = 120,
  damping = 28,
  zIndex = 50,
  className,
  children,
  style,
}: BlobCursorProps) {
  const reduce = useReducedMotion() ?? false;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rawId = useId().replace(/:/g, "");
  const filterId = `hulian-blob-${rawId}`;

  // 领头水滴的目标坐标（相对容器左上角）。拖尾水滴的 useSpring 串联追随它，
  // 单一目标源即可，弹簧的不同刚度天然拉开拖尾间距。
  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);

  const handleMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      targetX.set(e.clientX - rect.left);
      targetY.set(e.clientY - rect.top);
    },
    [targetX, targetY],
  );

  const count = Math.max(0, trailCount);

  return (
    <div
      ref={rootRef}
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{ zIndex, ...style }}
      onPointerMove={handleMove}
    >
      {gooey && (
        <svg aria-hidden className="absolute h-0 w-0" style={{ position: "absolute" }}>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" result="blur" stdDeviation={gooeyStrength} />
            <feColorMatrix
              in="blur"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
            />
          </filter>
        </svg>
      )}

      <LazyMotionProvider>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 select-none"
          style={
            gooey ? ({ filter: `url(#${filterId})` } as CSSProperties) : undefined
          }
        >
          {Array.from({ length: count }).map((_, i) => (
            <Blob
              key={i}
              size={pick(sizes, i, DEFAULT_SIZES[i % 3] ?? 72)}
              innerSize={pick(innerSizes, i, DEFAULT_INNER_SIZES[i % 3] ?? 22)}
              fillColor={fillColor}
              innerColor={innerColor}
              square={square}
              stiffness={i === 0 ? leadStiffness : trailStiffness}
              damping={damping}
              reduce={reduce}
              targetX={targetX}
              targetY={targetY}
            />
          ))}
        </div>
      </LazyMotionProvider>

      {children != null && <div className="relative z-10">{children}</div>}
    </div>
  );
}
