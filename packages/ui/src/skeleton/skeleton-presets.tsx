"use client";

import { useComponentLocale } from "../config/locale";
import { Skeleton } from "./skeleton";

// 组合骨架：把 Skeleton 原语按常见信息结构排好，免去各处手搓占位布局。
// 惯例：骨架屏不带边框/外壳——只用 shimmer 块占位，避免边框/阴影喧宾夺主（也绕开 Tailwind v4 裸 border = 近黑的坑）。

export interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  label?: string;
}

/** 表格加载骨架：rows×cols 个灰块。配 ProTable 外或独立列表用。 */
export function TableSkeleton({ rows = 6, cols = 4, label }: TableSkeletonProps) {
  const locale = useComponentLocale();
  const loadingLabel = label ?? locale.spinner?.loading ?? "加载中";
  return (
    <div className="space-y-3" role="status" aria-label={loadingLabel}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export interface CardSkeletonProps {
  count?: number;
  label?: string;
}

/** 卡片网格加载骨架：无边框无外壳，仅 shimmer 占位块（骨架屏惯例）。 */
export function CardSkeleton({ count = 3, label }: CardSkeletonProps) {
  const locale = useComponentLocale();
  const loadingLabel = label ?? locale.spinner?.loading ?? "加载中";
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label={loadingLabel}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export interface ListSkeletonProps {
  rows?: number;
  label?: string;
}

/** 头像+两行文字的列表加载骨架（会话/消息/通讯录）。 */
export function ListSkeleton({ rows = 5, label }: ListSkeletonProps) {
  const locale = useComponentLocale();
  const loadingLabel = label ?? locale.spinner?.loading ?? "加载中";
  return (
    <div className="space-y-2" role="status" aria-label={loadingLabel}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton shape="circle" className="size-9" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
