"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/cn";

// 瀑布流布局（"use client"·确定性 round-robin 分列 + 客户端响应式增强）：
//  · 分列策略用 round-robin（item[i] 进第 i % colCount 列）而非原生 CSS columns。
//    原因：CSS `columns` 会按内容高度自动「填谷」重排，元素的视觉顺序与 DOM 顺序脱节，
//    且不同浏览器/视口下断点抖动、SSR 与 client 计算不一致 → 顺序不稳定、易 hydration mismatch。
//    round-robin 是纯下标取模，SSR / client 结果完全一致，源数组顺序稳定可预测，便于无障碍读序。
//    代价是不做真正的「等高填谷」（高瀑布列可能略不平衡），但换来确定性与 SSR 安全，值。
//  · 列用 flex 纵向堆叠，列间 gap，列内 item 间也 gap（统一像素值）。
//  · 响应式列数：columns 可传对象 { base, sm, md, lg }。SSR / 首帧固定用 base 值（避免 hydration mismatch），
//    挂载后用 matchMedia 监听断点，按当前窗口宽度切到对应列数（纯增强，不影响首屏正确性）。
//  · 颜色/圆角全走主题 token，暗色自适应，组件本身不写死任何颜色。

export interface MasonryResponsiveColumns {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
}

export interface MasonryProps<T> {
  /** 数据源，按源顺序 round-robin 分列。 */
  items: T[];
  /** 渲染单个 item，返回的节点会被包进列内的格子。 */
  renderItem: (item: T, index: number) => ReactNode;
  /**
   * 列数。传数字固定列数；传对象按断点响应式（base 为 SSR/首帧值）。
   * 默认 3。
   */
  columns?: number | MasonryResponsiveColumns;
  /** 列间 & 列内 item 间距（像素）。默认 16。 */
  gap?: number;
  className?: string;
}

// 与 Tailwind 默认断点对齐（min-width）。base 为无断点兜底。
const BREAKPOINTS: { key: keyof MasonryResponsiveColumns; min: number }[] = [
  { key: "lg", min: 1024 },
  { key: "md", min: 768 },
  { key: "sm", min: 640 },
];

function clampColumnCount(n: number | undefined): number {
  if (!n || !Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

/** 把 columns 解析成「首帧/SSR 用的列数」——数字直接用，对象取 base（缺省 3）。 */
function resolveBaseColumns(columns: MasonryProps<unknown>["columns"]): number {
  if (typeof columns === "number") return clampColumnCount(columns);
  if (columns && typeof columns === "object") return clampColumnCount(columns.base ?? 3);
  return 3;
}

/** 客户端按当前 window 宽度从响应式对象里挑列数（命中最大满足的断点，回落 base）。 */
function pickResponsiveColumns(columns: MasonryResponsiveColumns, width: number): number {
  for (const bp of BREAKPOINTS) {
    if (width >= bp.min && columns[bp.key] != null) return clampColumnCount(columns[bp.key]);
  }
  return clampColumnCount(columns.base ?? 3);
}

export function Masonry<T>({ items, renderItem, columns = 3, gap = 16, className }: MasonryProps<T>) {
  const baseCount = resolveBaseColumns(columns);
  // SSR 与首帧统一用 base，挂载后再按窗口调整 → 无 hydration mismatch。
  const [colCount, setColCount] = useState(baseCount);

  // 用 ref 持有最新 columns，监听器里读它，避免把对象进 effect 依赖触发重订阅。
  const columnsRef = useRef(columns);
  columnsRef.current = columns;

  useEffect(() => {
    // 固定数字列：无需响应式监听，直接对齐（也覆盖运行时 columns 由对象切到数字的情况）。
    if (typeof columns === "number") {
      setColCount(clampColumnCount(columns));
      return;
    }
    if (typeof window === "undefined" || !columns) return;

    const recompute = () => {
      const cur = columnsRef.current;
      if (cur && typeof cur === "object") {
        setColCount(pickResponsiveColumns(cur, window.innerWidth));
      }
    };
    recompute();

    const mqls = BREAKPOINTS.map((bp) => window.matchMedia(`(min-width: ${bp.min}px)`));
    mqls.forEach((mql) => mql.addEventListener("change", recompute));
    return () => mqls.forEach((mql) => mql.removeEventListener("change", recompute));
    // columns 是数字时上面已 return；是对象时仅其引用变化需要重算首值，故依赖 columns。
  }, [columns]);

  // round-robin 分列：item[i] → 第 i % colCount 列。纯下标，SSR/client 一致。
  const cols = useMemo(() => {
    const buckets: { item: T; index: number }[][] = Array.from({ length: colCount }, () => []);
    items.forEach((item, index) => {
      buckets[index % colCount].push({ item, index });
    });
    return buckets;
  }, [items, colCount]);

  return (
    <div className={cn("flex w-full items-start", className)} style={{ gap }}>
      {cols.map((bucket, colIndex) => (
        <div key={colIndex} className="flex min-w-0 flex-1 flex-col" style={{ gap }}>
          {bucket.map(({ item, index }) => (
            <div key={index} className="min-w-0">
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
