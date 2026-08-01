"use client";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { GooeyNavItem, GooeyNavProps } from "./gooey-nav.types";

// 吸取自 React Bits GooeyNav：点击导航项时，一颗白色药丸滑到目标位置，并迸射一圈彩色粒子，
// 经 blur+contrast「胶质（gooey）」滤镜把粒子与药丸熔成黏稠液滴，再随机回落收束。
// 瑚琏化：去除原版命令式 createElement/classList 操作，改为声明式 React 受控渲染；
//   药丸用 motion（m.span）平滑滑动测位（reduced-motion 即时跳位、不熔粒子，DOM 两态一致）；
//   粒子颜色吃瑚琏 chart token（var(--color-chart-N)，替原版裸 --color-N）；减包用 m + LazyMotionProvider；
//   关键帧 hulian-gooey-nav-particle / -point 落 preset.css。

interface ParticleSpec {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotate: number;
  scale: number;
  duration: number;
  color: string;
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const noise = (n = 1) => n / 2 - Math.random() * n;

function getXY(distance: number, pointIndex: number, totalPoints: number): [number, number] {
  const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
  return [distance * Math.cos(angle), distance * Math.sin(angle)];
}

function buildParticles(
  count: number,
  distances: [number, number],
  baseTime: number,
  colors: number[],
  seed: number,
): ParticleSpec[] {
  const out: ParticleSpec[] = [];
  for (let i = 0; i < count; i++) {
    const [sx, sy] = getXY(distances[0], count - i, count);
    const [ex, ey] = getXY(distances[1] + noise(7), count - i, count);
    const rotate = noise(10);
    const colorIdx = colors[Math.floor(Math.random() * colors.length)] ?? 1;
    out.push({
      id: seed * 1000 + i,
      startX: sx,
      startY: sy,
      endX: ex,
      endY: ey,
      rotate: rotate > 0 ? (rotate + 5) * 10 : (rotate - 5) * 10,
      scale: 1 + noise(0.2),
      duration: baseTime + noise(baseTime * 0.5),
      color: `var(--color-chart-${colorIdx})`,
    });
  }
  return out;
}

export function GooeyNav({
  items,
  initialActiveIndex = 0,
  activeIndex: controlledActive,
  onChange,
  animationTime = 600,
  particleCount = 14,
  particleDistances = [86, 12],
  colors = [1, 2, 3, 1, 4],
  className,
  style,
  ...props
}: GooeyNavProps) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const seedRef = useRef(0);

  const isControlled = controlledActive != null;
  const [uncontrolled, setUncontrolled] = useState(initialActiveIndex);
  const active = isControlled ? controlledActive : uncontrolled;

  const [pill, setPill] = useState<Rect | null>(null);
  const [particles, setParticles] = useState<ParticleSpec[]>([]);

  // 量取选中项几何，更新药丸位置（相对容器坐标）
  const measure = useCallback((index: number) => {
    const list = listRef.current;
    const container = containerRef.current;
    if (!list || !container) return;
    const li = list.querySelectorAll("li")[index];
    if (!li) return;
    const cRect = container.getBoundingClientRect();
    const lRect = li.getBoundingClientRect();
    setPill({
      left: lRect.left - cRect.left,
      top: lRect.top - cRect.top,
      width: lRect.width,
      height: lRect.height,
    });
  }, []);

  // 初次挂载 + 选中变化 + 容器 resize 时重新测位
  useLayoutEffect(() => {
    measure(active);
  }, [active, measure, items]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure(active));
    ro.observe(container);
    return () => ro.disconnect();
  }, [active, measure]);

  const trigger = useCallback(
    (index: number) => {
      if (index === active) return;
      onChange?.(index);
      if (!isControlled) setUncontrolled(index);
      if (reduce || particleCount <= 0) return;
      const seed = ++seedRef.current;
      const next = buildParticles(particleCount, particleDistances, animationTime, colors, seed);
      setParticles(next);
      const maxLife = Math.max(...next.map((p) => p.duration), animationTime);
      window.setTimeout(() => {
        setParticles((cur) => cur.filter((p) => Math.floor(p.id / 1000) !== seed));
      }, maxLife + 60);
    },
    [active, animationTime, colors, isControlled, onChange, particleCount, particleDistances, reduce],
  );

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, index: number) => {
    if ((items[index]?.href ?? "#") === "#") e.preventDefault();
    trigger(index);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      trigger(index);
    }
  };

  const reactId = useId();

  return (
    <LazyMotionProvider>
      <div
        {...props}
        ref={containerRef}
        data-slot="gooey-nav"
        className={cn("relative inline-block isolate", className)}
        style={style}
      >
        {/* 胶质粒子层：blur+contrast 熔接，mix-blend 让粒子与药丸黏成液滴 */}
        <span
          aria-hidden
          data-slot="gooey-nav-goo"
          className="pointer-events-none absolute inset-0 z-0 [filter:blur(6px)_contrast(18)] mix-blend-screen dark:mix-blend-lighten"
        >
          {/* 滑动药丸 */}
          {pill ? (
            <m.span
              data-slot="gooey-nav-pill"
              className="absolute rounded-full bg-foreground"
              animate={{ left: pill.left, top: pill.top, width: pill.width, height: pill.height }}
              initial={false}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 320, damping: 26, mass: 0.7 }
              }
            />
          ) : null}
          {/* 迸射粒子 */}
          {particles.map((p) => (
            <span
              key={`${reactId}-${p.id}`}
              data-slot="gooey-nav-particle"
              className="absolute left-1/2 top-1/2 block size-[18px] -translate-x-1/2 -translate-y-1/2 [animation:hulian-gooey-nav-particle_var(--gn-dur)_ease_forwards] motion-reduce:[animation:none]"
              style={
                {
                  "--gn-sx": `${p.startX}px`,
                  "--gn-sy": `${p.startY}px`,
                  "--gn-ex": `${p.endX}px`,
                  "--gn-ey": `${p.endY}px`,
                  "--gn-rot": `${p.rotate}deg`,
                  "--gn-dur": `${p.duration}ms`,
                  left: pill ? pill.left + pill.width / 2 : "50%",
                  top: pill ? pill.top + pill.height / 2 : "50%",
                } as CSSProperties
              }
            >
              <span
                className="block size-[18px] rounded-full [animation:hulian-gooey-nav-point_var(--gn-dur)_ease_forwards] motion-reduce:[animation:none]"
                style={{ background: p.color, "--gn-scale": `${p.scale}` } as CSSProperties}
              />
            </span>
          ))}
        </span>

        {/* 导航本体 */}
        <nav data-slot="gooey-nav-bar" className="relative z-10">
          <ul
            ref={listRef}
            className="m-0 flex list-none gap-2 p-0 text-sm font-medium"
          >
            {items.map((item: GooeyNavItem, index) => {
              const isActive = index === active;
              return (
                <li key={item.label + index} className="relative">
                  <a
                    href={item.href ?? "#"}
                    aria-current={isActive ? "page" : undefined}
                    onClick={(e) => handleClick(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={cn(
                      "inline-block rounded-full px-4 py-2 transition-colors duration-300",
                      "outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive ? "text-bg" : "text-foreground/70 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </LazyMotionProvider>
  );
}
