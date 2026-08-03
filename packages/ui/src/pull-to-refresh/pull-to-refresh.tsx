"use client";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { RefreshCw } from "../_icons";
import { cn } from "../lib/cn";
import type { PullToRefreshProps } from "./pull-to-refresh.types";
import { useComponentLocale } from "../config/locale-context";

// 下拉刷新（"use client"·零依赖）：滚动容器置顶时下拉，内容 translateY 跟手(带阻尼)，越过 threshold 进 armed，
// 松手触发 onRefresh 并保持刷新态直至 Promise 结束再回弹。头部指示器高度随下拉距离生长。
// 两套手势入口：① 触屏 / 鼠标按住拖拽 → Pointer Events；② 桌面触控板 / 滚轮到顶继续上滚(overscroll) → wheel
// （桌面"下拉"的自然手势是 wheel 而非 pointer，缺它则触控板用户无法触发——见下方 useEffect）。
type Status = "idle" | "pulling" | "armed" | "refreshing";

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 64,
  resistance = 0.5,
  pullingText,
  armedText,
  refreshingText,
  className,
}: PullToRefreshProps) {
  const locale = useComponentLocale().pullToRefresh ?? {
    pulling: "下拉刷新",
    armed: "释放刷新",
    refreshing: "刷新中…",
  };
  const resolvedPullingText = pullingText ?? locale.pulling;
  const resolvedArmedText = armedText ?? locale.armed;
  const resolvedRefreshingText = refreshingText ?? locale.refreshing;
  const scroller = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const startY = useRef(0);
  const active = useRef(false);

  const reset = () => {
    setStatus("idle");
    setDist(0);
  };

  // 桌面触控板/滚轮：置顶继续向"下拉"方向滚(自然滚动下 deltaY<0=overscroll)即等同下拉刷新。
  // wheel 无 release 事件 → 累积位移 + 停止防抖(140ms)判定松手；non-passive 监听以 preventDefault 阻原生回弹。
  // 监听只挂一次：最新 props/回调经 latest ref 读取（避免 onRefresh 内联新引用导致每渲染重挂、丢失累积值）。
  const latest = useRef({ onRefresh, threshold, resistance, status });
  latest.current = { onRefresh, threshold, resistance, status };
  const wheelAcc = useRef(0);
  const wheelTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const cur = latest.current;
      if (cur.status === "refreshing") return;
      if (el.scrollTop <= 0 && e.deltaY < 0) {
        e.preventDefault();
        wheelAcc.current = Math.min(
          cur.threshold * 2,
          wheelAcc.current + -e.deltaY * cur.resistance,
        );
        setDist(wheelAcc.current);
        setStatus(wheelAcc.current >= cur.threshold ? "armed" : "pulling");
        clearTimeout(wheelTimer.current);
        wheelTimer.current = setTimeout(() => {
          if (wheelAcc.current >= latest.current.threshold) {
            setStatus("refreshing");
            setDist(latest.current.threshold);
            Promise.resolve(latest.current.onRefresh()).finally(() => {
              wheelAcc.current = 0;
              reset();
            });
          } else {
            wheelAcc.current = 0;
            reset();
          }
        }, 140);
      } else if (wheelAcc.current !== 0) {
        wheelAcc.current = 0;
        reset();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(wheelTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (status === "refreshing") return;
    if ((scroller.current?.scrollTop ?? 0) > 0) return;
    startY.current = e.clientY;
    active.current = true;
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!active.current) return;
    const dy = e.clientY - startY.current;
    if (dy <= 0 || (scroller.current?.scrollTop ?? 0) > 0) {
      active.current = false;
      reset();
      return;
    }
    const d = dy * resistance;
    setDist(d);
    setStatus(d >= threshold ? "armed" : "pulling");
  };

  const onPointerUp = async () => {
    if (!active.current) return;
    active.current = false;
    if (status === "armed") {
      setStatus("refreshing");
      setDist(threshold);
      try {
        await onRefresh();
      } finally {
        reset();
      }
    } else {
      reset();
    }
  };

  const refreshing = status === "refreshing";

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 flex items-end justify-center overflow-hidden text-xs text-muted"
        style={{ height: dist }}
      >
        <div className="flex items-center gap-1.5 pb-2">
          <RefreshCw
            className={cn(
              "size-4 transition-transform",
              refreshing && "animate-spin",
              status === "armed" && "rotate-180",
            )}
            aria-hidden
          />
          <span>
            {refreshing
              ? resolvedRefreshingText
              : status === "armed"
              ? resolvedArmedText
              : resolvedPullingText}
          </span>
        </div>
      </div>
      <div
        ref={scroller}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="h-full touch-pan-y overflow-y-auto overscroll-contain"
        style={{
          transform: `translateY(${dist}px)`,
          transition: active.current ? "none" : "transform 0.2s var(--hl-ease-out, ease-out)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
