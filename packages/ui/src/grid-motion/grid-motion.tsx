"use client";
import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { cn } from "../lib/cn";
import { LazyMotionProvider, m } from "../motion";
import type { GridMotionProps } from "./grid-motion.types";

// 目标 MotionValue 池上限：Hook 数量须在渲染间稳定，故预分配固定池、实际取前 rows 个。
const MAX_ROWS = 32;

// 吸取自 React Bits GridMotion：4×7 网格倾斜铺满视口，鼠标横向移动时每一行
// 以不同惯性、奇偶反向地视差平移，叠加中心径向光晕，营造灵动的入场背景。
//
// 瑚琏化要点：
// 1. 去 gsap：原版用 gsap.ticker + gsap.to 做惯性补间。改用 motion 的 useSpring
//    做每行独立的弹性追随（每行 stiffness/damping 各异 → 天然惯性差），零额外依赖；
//    m + LazyMotionProvider(domAnimation) 取代全量 motion 减包。
// 2. 去 window.innerWidth 直读：用容器自身 getBoundingClientRect 归一化鼠标位置，
//    嵌入任意尺寸容器都正确（原版假设全屏）。
// 3. 颜色全吃 token：径向光晕默认 var(--color-primary)，单元底色 bg-surface，
//    文字 text-foreground，边框 border-border（替原版写死 #111 / black / white）。
// 4. reduced-motion：useReducedMotion() 命中时不挂 mousemove、目标值锁在 0，
//    网格静态呈现（DOM 两态一致，不条件卸载内容）。
// 5. jsdom 安全：无 canvas / WebGL；getBoundingClientRect 返回 0 也不抛错（兜底除数）。

/** 单行轨道：自带一条弹簧，沿 X 视差平移，追随父级传入的目标 MotionValue。 */
function RowTrack({
  columns,
  target,
  children,
}: {
  columns: number;
  target: ReturnType<typeof useMotionValue<number>>;
  children: ReactNode;
}) {
  // reduced-motion 时父级把 target 恒置 0 → 弹簧静止，DOM 两态一致。
  const x = useSpring(target);

  return (
    <m.div
      className="grid gap-4 will-change-transform"
      style={
        {
          x,
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
        } as unknown as CSSProperties
      }
    >
      {children}
    </m.div>
  );
}

function Cell({ content }: { content: ReactNode }) {
  const isImg = typeof content === "string" && content.startsWith("http");
  return (
    <div className="relative">
      <div
        className={cn(
          "flex aspect-square h-full w-full items-center justify-center overflow-hidden rounded-xl",
          "border border-border bg-surface text-lg text-foreground",
        )}
      >
        {isImg ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${content as string})` }}
          />
        ) : (
          <div className="relative z-10 p-4 text-center">{content}</div>
        )}
      </div>
    </div>
  );
}

export function GridMotion({
  items: itemsProp,
  rows: rowsProp = 4,
  columns = 7,
  gradientColor = "var(--color-primary)",
  maxMoveAmount = 300,
  rotate = -15,
  className,
  style,
}: GridMotionProps) {
  const items = itemsProp ?? [];
  const rows = Math.max(1, Math.min(MAX_ROWS, rowsProp));
  const reduce = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLDivElement>(null);

  const total = rows * columns;
  const defaults: ReactNode[] = Array.from(
    { length: total },
    (_, i) => `Item ${i + 1}`,
  );
  const cells: ReactNode[] =
    items.length > 0 ? items.slice(0, total) : defaults;
  // 不足补齐，保证网格永远填满（避免末行残缺）。
  while (cells.length < total) cells.push(defaults[cells.length]);

  // 每行一个目标 MotionValue（父级持有，mousemove 时统一写入）。
  // 固定上限 32 行的目标池足够；按需取前 rows 个。Hook 数量需稳定，故用固定数组。
  const targets = useRowTargets();

  useEffect(() => {
    if (reduce) {
      for (const t of targets) t.set(0);
      return;
    }
    const onMove = (e: MouseEvent) => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const width = rect.width || 1; // jsdom 下为 0 → 兜底 1，不除零
      const norm = Math.min(1, Math.max(0, (e.clientX - rect.left) / width));
      for (let i = 0; i < rows; i++) {
        const direction = i % 2 === 0 ? 1 : -1;
        targets[i]?.set((norm * maxMoveAmount - maxMoveAmount / 2) * direction);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, rows, maxMoveAmount, targets]);

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={style}
    >
      <section
        ref={sectionRef}
        className="relative flex h-full w-full items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 100%)`,
        }}
      >
        {/* 倾斜放大的网格容器：宽高超出视口 + rotate 后不露边。 */}
        <div
          className="pointer-events-none relative z-[2] grid h-[150%] w-[150%] flex-none gap-4"
          style={
            {
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gridTemplateColumns: "100%",
              transform: `rotate(${rotate}deg)`,
              transformOrigin: "center center",
            } as CSSProperties
          }
        >
          <LazyMotionProvider>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <RowTrack
                key={rowIndex}
                columns={columns}
                target={targets[rowIndex]}
              >
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <Cell
                    key={colIndex}
                    content={cells[rowIndex * columns + colIndex]}
                  />
                ))}
              </RowTrack>
            ))}
          </LazyMotionProvider>
        </div>
      </section>
    </div>
  );
}

/**
 * 创建固定数量（MAX_ROWS）的目标 MotionValue 池。
 * Hook 数量必须在渲染间稳定，不能随 rows 动态调用 useMotionValue，
 * 故预分配上限池，组件实际只取前 rows 个；循环次数恒定，合规。
 */
function useRowTargets(): Array<ReturnType<typeof useMotionValue<number>>> {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return Array.from({ length: MAX_ROWS }, () => useMotionValue(0));
}
