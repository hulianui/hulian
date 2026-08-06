"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import type { InfiniteMenuItem, InfiniteMenuProps } from "./infinite-menu.types";

// 吸取自 React Bits InfiniteMenu：一颗可拖拽旋转的菜单球，菜单项围绕球面排布，
// 正对镜头的项「贴靠」为激活项并在覆盖层显示标题/描述 + 动作箭头，松手有惯性衰减。
//
// 瑚琏化（重要改造）：
// 1. 去依赖 —— 原版用 gl-matrix + 裸 WebGL2 + 实例化绘制 + 图集纹理（均不在 @hulianui/ui 允许的依赖内）。
//    瑚琏改用「CSS 3D 变换 + Fibonacci 球面分布 + requestAnimationFrame 自旋/惯性」纯 DOM 重构，
//    零运行时依赖、SSR/jsdom 安全（不碰 getContext，不需要真实 WebGL）。
// 2. 卡面圆形裁切吃 token：边框 border-border、底色 bg-surface、激活环 ring-primary；
//    覆盖层文案 text-foreground / text-muted；动作按钮 bg-primary text-primary-foreground。
// 3. reduced-motion：useReducedMotion() 关闭自动旋转与惯性（停在当前姿态），DOM 结构完全一致。
// 4. 拖拽用原生 PointerEvents（照库内 Flow/Kanban 范式），setPointerCapture 尽力而为。
// 5. 激活项 = 当前朝向最正（投影后 z 最大）的项，松手后平滑贴靠到正前方。

// ---------------------------------------------------------------------------
// 几何：Fibonacci 球面均匀分布 N 个单位向量
// ---------------------------------------------------------------------------
interface Vec3 {
  x: number;
  y: number;
  z: number;
}

function fibonacciSphere(n: number): Vec3[] {
  if (n <= 0) return [];
  if (n === 1) return [{ x: 0, y: 0, z: 1 }];
  const pts: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5)); // 黄金角
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2; // y ∈ [1, -1]
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
  }
  return pts;
}

// 绕 Y 再绕 X 旋转一个向量（角度为弧度）
function rotate(p: Vec3, ry: number, rx: number): Vec3 {
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  // 绕 Y
  const x1 = p.x * cy + p.z * sy;
  const z1 = -p.x * sy + p.z * cy;
  const y1 = p.y;
  // 绕 X
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const y2 = y1 * cx - z1 * sx;
  const z2 = y1 * sx + z1 * cx;
  return { x: x1, y: y2, z: z2 };
}

const TAU = Math.PI * 2;

export function InfiniteMenu({
  items: itemsProp,
  scale = 1,
  itemSize = 88,
  autoRotate = 6,
  onActiveItemChange,
  onItemActivate,
  className,
  style,
}: InfiniteMenuProps) {
  const items = itemsProp ?? [];
  const locale = useComponentLocale().infiniteMenu ?? {
    openItem: (title) => `打开 ${title}`,
    openActive: "打开激活项",
    placeholderTitle: (index) => `菜单项 ${index}`,
    placeholderDescription: "占位项 · 传入 items 替换",
  };
  const reduced = useReducedMotion();

  const placeholderItems = useMemo<InfiniteMenuItem[]>(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        title: locale.placeholderTitle(i + 1),
        description: locale.placeholderDescription,
      })),
    [locale],
  );
  const data = items.length > 0 ? items : placeholderItems;
  const points = useMemo(() => fibonacciSphere(data.length), [data.length]);

  // 球半径（px）：随 scale 缩放
  const radius = 130 * scale;

  // 旋转姿态 —— 用 ref 持有真实姿态（RAF 内更新），用 state 仅驱动重渲染
  const rotRef = useRef({ ry: 0, rx: 0 });
  const velRef = useRef({ ry: 0, rx: 0 });
  const draggingRef = useRef(false);
  const lastPtrRef = useRef({ x: 0, y: 0 });
  const [, forceTick] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const activeIndexRef = useRef(0);
  const movingRef = useRef(false);

  const onActiveItemChangeRef = useRef(onActiveItemChange);
  onActiveItemChangeRef.current = onActiveItemChange;

  // 计算当前姿态下「最正」的项（投影后 z 最大）
  const computeActive = useCallback(() => {
    let best = 0;
    let bestZ = -Infinity;
    const { ry, rx } = rotRef.current;
    for (let i = 0; i < points.length; i++) {
      const z = rotate(points[i]!, ry, rx).z;
      if (z > bestZ) {
        bestZ = z;
        best = i;
      }
    }
    return best;
  }, [points]);

  // RAF 驱动：自旋 / 惯性 / 贴靠
  useEffect(() => {
    if (points.length === 0) return;
    let raf = 0;
    let prev = performance.now();
    const autoSpeed = reduced ? 0 : (autoRotate * Math.PI) / 180; // 弧度/秒

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;

      const rot = rotRef.current;
      const vel = velRef.current;

      if (draggingRef.current) {
        // 拖拽中：姿态由 pointermove 直接累加，这里只标记移动态
        setMoving(true);
      } else {
        // 松手：先跑惯性，再衰减；惯性足够小后自动自旋 + 贴靠
        const speed = Math.hypot(vel.ry, vel.rx);
        if (speed > 0.0005 && !reduced) {
          rot.ry += vel.ry * dt;
          rot.rx += vel.rx * dt;
          vel.ry *= 0.94;
          vel.rx *= 0.94;
          setMoving(true);
        } else {
          vel.ry = 0;
          vel.rx = 0;
          // 自动自旋
          rot.ry += autoSpeed * dt;
          setMoving(false);
        }
      }

      // 限制俯仰角，避免翻转到背面失序
      rot.rx = Math.max(-1.2, Math.min(1.2, rot.rx));
      rot.ry = ((rot.ry % TAU) + TAU) % TAU;

      // 激活项检测（仅静止/缓动态更新回调，避免高频抖动）
      const nextActive = computeActive();
      if (nextActive !== activeIndexRef.current) {
        activeIndexRef.current = nextActive;
        setActiveIndex(nextActive);
        onActiveItemChangeRef.current?.(data[nextActive]!, nextActive);
      }

      forceTick((t) => (t + 1) % 1_000_000);
    };

    function setMoving(v: boolean) {
      if (movingRef.current !== v) {
        movingRef.current = v;
        setIsMoving(v);
      }
    }

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.length, reduced, autoRotate, computeActive, data]);

  // 指针拖拽
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    draggingRef.current = true;
    lastPtrRef.current = { x: e.clientX, y: e.clientY };
    velRef.current = { ry: 0, rx: 0 };
    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    } catch {
      // 尽力而为
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastPtrRef.current.x;
    const dy = e.clientY - lastPtrRef.current.y;
    lastPtrRef.current = { x: e.clientX, y: e.clientY };
    const k = 0.006; // 像素 → 弧度
    rotRef.current.ry += dx * k;
    rotRef.current.rx -= dy * k;
    // 记录速度（弧度/秒近似，供松手惯性）
    velRef.current = { ry: dx * k * 60, rx: -dy * k * 60 };
  }, []);

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    } catch {
      // 尽力而为
    }
  }, []);

  const activeItem = data[activeIndex];

  const handleActivate = useCallback(() => {
    const item = activeItem;
    if (!item) return;
    const res = onItemActivate?.(item, activeIndex);
    if (res === false) return;
    if (item.link && /^https?:/i.test(item.link) && typeof window !== "undefined") {
      window.open(item.link, "_blank", "noopener,noreferrer");
    }
  }, [activeItem, activeIndex, onItemActivate]);

  return (
    <div
      className={cn("relative h-full min-h-[20rem] w-full select-none overflow-hidden", className)}
      style={style}
      data-infinite-menu=""
    >
      {/* 3D 舞台 —— 拖拽热区 */}
      <div
        className="absolute inset-0 grid cursor-grab place-items-center touch-none active:cursor-grabbing [perspective:1000px]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        aria-hidden
      >
        <div
          className="relative [transform-style:preserve-3d]"
          style={{ width: radius * 2, height: radius * 2 }}
        >
          {data.map((item, i) => {
            const base = points[i] ?? { x: 0, y: 0, z: 1 };
            const p = rotate(base, rotRef.current.ry, rotRef.current.rx);
            // 投影：z 越大越靠前 → 更大更亮；背面缩小淡出
            const depth = (p.z + 1) / 2; // 0..1
            const itemScale = 0.55 + depth * 0.55;
            const opacity = 0.25 + depth * 0.75;
            const isActive = i === activeIndex;
            return (
              <div
                key={i}
                className={cn(
                  "absolute left-1/2 top-1/2 rounded-full border border-border bg-surface shadow-md",
                  "overflow-hidden ring-0 transition-[box-shadow] will-change-transform",
                  isActive && "ring-2 ring-primary",
                )}
                style={{
                  width: itemSize,
                  height: itemSize,
                  marginLeft: -itemSize / 2,
                  marginTop: -itemSize / 2,
                  transform: `translate3d(${p.x * radius}px, ${-p.y * radius}px, ${
                    p.z * radius
                  }px) scale(${itemScale})`,
                  opacity,
                  zIndex: Math.round(depth * 1000),
                }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title ?? ""}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted">
                    {(item.title ?? "·").slice(0, 1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 覆盖层：激活项标题 / 描述 / 动作按钮。isMoving 时淡出，静止时浮现。 */}
      {activeItem && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2000] flex flex-col items-center gap-1 p-4 text-center">
          <h2
            className={cn(
              "text-base font-semibold text-foreground transition-[translate,opacity] duration-300 ease-out",
              isMoving ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
            )}
          >
            {activeItem.title}
          </h2>
          {activeItem.description && (
            <p
              className={cn(
                "max-w-xs text-xs text-muted transition-[translate,opacity] duration-300 ease-out",
                isMoving ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
              )}
            >
              {activeItem.description}
            </p>
          )}
        </div>
      )}

      {activeItem && (
        <button
          type="button"
          onClick={handleActivate}
          aria-label={activeItem.title ? locale.openItem(activeItem.title) : locale.openActive}
          className={cn(
            "absolute right-4 top-4 z-[2000] grid size-10 place-items-center rounded-full",
            "bg-primary text-primary-foreground shadow-md transition-[scale,opacity,filter] duration-300 ease-out",
            "hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            isMoving ? "scale-90 opacity-0" : "scale-100 opacity-100",
          )}
        >
          <ArrowUpRight className="size-5" />
        </button>
      )}
    </div>
  );
}
