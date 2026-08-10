"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss, pressableClass } from "../motion";
import type { SegmentedProps } from "./segmented.types";

// 尺寸：root 高度 + 段内边距。
const sizeClasses: Record<"sm" | "md", { root: string; item: string }> = {
  sm: { root: "h-8 text-sm", item: "px-2.5" },
  md: { root: "h-10 text-sm", item: "px-3.5" },
};

// SSR/jsdom 安全：浏览器用 layout effect 测量（避闪），服务端降级为普通 effect（不执行）。
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// 自研分段控制器：WAI-ARIA radiogroup 语义（互斥单选 + 方向键漫游 + roving tabindex）。
// 动画指示器复用 Tabs 的 active-tab CSS 变量滑块技法：测好选中段的 left/width，经纯 CSS
// transition 平滑滑动（时长/曲线复用 motion token CSS 镜像，零 motion 运行时）。
// Base UI 无 Segmented 原语，故自研；radio 引擎/键盘也手写（区别于 Tabs 薄包 Base UI）。
export function Segmented({
  items,
  value,
  defaultValue,
  onValueChange,
  disabled,
  size = "md",
  className,
  "aria-label": ariaLabel,
  ...rest
}: SegmentedProps) {
  const firstEnabled = items.find((i) => !i.disabled)?.value;
  const [internal, setInternal] = useState<string | undefined>(defaultValue ?? firstEnabled);
  const selected = value ?? internal;
  const selectedIndex = Math.max(
    0,
    items.findIndex((i) => i.value === selected),
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // 测量选中段几何 → 驱动滑块。jsdom 下 offsetWidth=0 → indicator.width 守卫使其不渲染。
  const measure = useCallback(() => {
    const el = btnRefs.current[selectedIndex];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [selectedIndex]);

  useIsoLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    if (rootRef.current) ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const select = (next: string) => {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  };

  // 方向键漫游：在未禁用段间循环移动，选中跟随焦点（WAI-ARIA radiogroup 规范）。
  const moveTo = (dir: 1 | -1, from: number) => {
    const n = items.length;
    for (let step = 1; step <= n; step++) {
      const idx = (((from + dir * step) % n) + n) % n;
      if (!items[idx].disabled) {
        select(items[idx].value);
        btnRefs.current[idx]?.focus();
        return;
      }
    }
  };

  const moveToEdge = (toStart: boolean) => {
    const order = items.map((_, i) => (toStart ? i : items.length - 1 - i));
    for (const idx of order) {
      if (!items[idx].disabled) {
        select(items[idx].value);
        btnRefs.current[idx]?.focus();
        return;
      }
    }
  };

  const onKeyDown = (e: KeyboardEvent, idx: number) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        moveTo(1, idx);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        moveTo(-1, idx);
        break;
      case "Home":
        e.preventDefault();
        moveToEdge(true);
        break;
      case "End":
        e.preventDefault();
        moveToEdge(false);
        break;
    }
  };

  const indicatorStyle: CSSProperties = indicator
    ? {
        width: indicator.width,
        transform: `translateX(${indicator.left}px)`,
        transitionProperty: "transform, width",
        transitionDuration: motionDurationCss.base,
        transitionTimingFunction: motionEaseCss.out,
      }
    : {};

  return (
    <div
      {...rest}
      ref={rootRef}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(
        // bg-track：与 Tabs solid 同一个凹槽轨道语义，滑块用 bg-surface 浮在其上（#152）。
        "relative inline-flex items-center gap-1 rounded-[var(--radius)] bg-track p-1 text-foreground",
        sizeClasses[size].root,
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {/* 滑块：测好的 left/width 经 CSS transition 平滑滑动（复用 Tabs active-tab 技法）。
          未测量(width=0)时不渲染，避免初始闪一个 0 宽方块。 */}
      {indicator && indicator.width > 0 && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-1 left-0 top-1 rounded-[calc(var(--radius)-0.25rem)] bg-surface shadow-sm"
          style={indicatorStyle}
        />
      )}
      {items.map((item, idx) => {
        const isSelected = item.value === selected;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={item.ariaLabel ?? (typeof item.label === "string" ? undefined : item.value)}
            ref={(el) => {
              btnRefs.current[idx] = el;
            }}
            disabled={disabled || item.disabled}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => select(item.value)}
            onKeyDown={(e) => onKeyDown(e, idx)}
            className={cn(
              // pressableClass 平替 transition-colors 并补按下缩放：滑块（下方 absolute 层）不受影响，
              // 只有当前项的文字/图标轻微内缩，形成"按到了"的即时反馈。
              // min-w-0 + truncate 缺一不可：flex item 默认 min-width:auto，配上 whitespace-nowrap
              // 后完全不可压缩，于是 root 的实际宽度被撑到「所有段文字之和」，flex-1 形同虚设，
              // 装不下的部分被上游容器裁掉——**选项存在但不可见也不可点**（#114）。
              // 补上之后段会等分压缩、文字变省略号，任何宽度下每一段都仍然可达。
              `relative z-10 inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 truncate whitespace-nowrap rounded-[calc(var(--radius)-0.25rem)] font-medium outline-none ${pressableClass}`,
              sizeClasses[size].item,
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
              isSelected ? "text-foreground" : "hover:text-foreground",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
