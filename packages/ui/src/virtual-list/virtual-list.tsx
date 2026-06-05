"use client";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef } from "react";
import { cn } from "../lib/cn";
import type { VirtualListProps } from "./virtual-list.types";

// 虚拟滚动列表（"use client"·包 @tanstack/react-virtual）：仅渲染视口内 + overscan 行，撑起总高占位。
// 定高传 number，变高传 (index)=>px 并对该行挂 measureElement 实测校正。initialRect 喂初始视口高，
// 让 SSR / 无布局环境(jsdom)首帧即可算出可见行。末行可见触发 onReachEnd 接无限加载。
export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  height = 360,
  overscan = 5,
  getKey,
  onReachEnd,
  className,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const dynamic = typeof itemHeight === "function";
  const estimate = dynamic ? (itemHeight as (i: number) => number) : () => itemHeight as number;
  const initialHeight = typeof height === "number" ? height : 360;

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: estimate,
    overscan,
    initialRect: { width: 0, height: initialHeight },
  });

  const vItems = virtualizer.getVirtualItems();
  const lastIndex = vItems.length ? vItems[vItems.length - 1].index : -1;

  useEffect(() => {
    if (onReachEnd && items.length > 0 && lastIndex >= items.length - 1) onReachEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastIndex, items.length]);

  return (
    <div
      ref={parentRef}
      className={cn("overflow-auto", className)}
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    >
      <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
        {vItems.map((vi) => (
          <div
            key={getKey ? getKey(items[vi.index], vi.index) : vi.key}
            data-index={vi.index}
            ref={dynamic ? virtualizer.measureElement : undefined}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${vi.start}px)`,
            }}
          >
            {renderItem(items[vi.index], vi.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
