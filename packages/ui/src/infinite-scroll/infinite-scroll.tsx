"use client";
import { useEffect, useRef, useState } from "react";
import { RefreshCw } from "../_icons";
import { cn } from "../lib/cn";
import type { InfiniteScrollProps } from "./infinite-scroll.types";

// 无限滚动（"use client"·IntersectionObserver）：底部哨兵进入视口即调 onLoadMore，
// 自动定位最近可滚动祖先作 root（无则视口）；hasMore=false 时停观察并显示完结文案。加载中以 ref 锁防重入。
function findScrollParent(el: HTMLElement): HTMLElement | null {
  let p = el.parentElement;
  while (p) {
    const oy = getComputedStyle(p).overflowY;
    if (oy === "auto" || oy === "scroll") return p;
    p = p.parentElement;
  }
  return null;
}

export function InfiniteScroll({
  onLoadMore,
  hasMore,
  children,
  threshold = 100,
  loadingText = "加载中…",
  finishedText = "没有更多了",
  className,
}: InfiniteScrollProps) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const root = findScrollParent(el);
    const io = new IntersectionObserver(
      async (entries) => {
        if (!entries[0]?.isIntersecting || loadingRef.current || !hasMore) return;
        loadingRef.current = true;
        setLoading(true);
        try {
          await onLoadMore();
        } finally {
          loadingRef.current = false;
          setLoading(false);
        }
      },
      { root, rootMargin: `0px 0px ${threshold}px 0px` },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, threshold, onLoadMore]);

  return (
    <div className={cn(className)}>
      {children}
      <div ref={sentinel} className="flex items-center justify-center gap-1.5 py-3 text-xs text-muted">
        {hasMore ? (
          loading ? (
            <>
              <RefreshCw className="size-3.5 animate-spin" aria-hidden />
              <span>{loadingText}</span>
            </>
          ) : null
        ) : (
          <span>{finishedText}</span>
        )}
      </div>
    </div>
  );
}
