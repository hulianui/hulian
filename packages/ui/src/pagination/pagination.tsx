"use client";
// 纯皮肤分页器：受控（page + onPageChange）；页码区间走纯函数 getPaginationRange。
// 页码/箭头复用 Button 的 buttonVariants 皮肤（hover/focus-ring/disabled），但用原生 <button>。
//
// 选中态动画：复用 Segmented 的「测量 + CSS 滑块」技法（零 motion 运行时，时长/曲线取自 motion
// token 的 CSS 镜像）。一条绝对定位的蓝色滑块测好当前页按钮的 left/width，经 CSS transition 在
// 页码间平滑滑动——取代旧的「整列 variant 原地淡入淡出」（150ms 颜色切换看着像闪一下）。
// 为什么不上 motion 的 layoutId：本库 LazyMotion 只载 domAnimation（不含 layout 特性，见 motion/lazy），
// 且密集按钮列若每个都是 motion.button + 弹簧会抖；CSS 滑块两者都规避。
// 当前页 aria-current="page"；省略号为不可点装饰位。
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "../_icons";
import { buttonVariants } from "../button";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { getPaginationRange } from "./pagination.range";
import type { PaginationProps } from "./pagination.types";

// 方块按钮：复用 buttonVariants 的 focus-ring/disabled，仅覆写尺寸为定高、多位数可横向生长。
const SQUARE = "h-9 min-w-9 px-1.5";
// press 与颜色统一过渡：transform 走合成层；覆盖 buttonVariants 自带的 transition-colors。
const PRESS = "transition-[color,background-color,box-shadow,transform] duration-150 active:scale-[0.97]";

// SSR/jsdom 安全：浏览器用 layout effect 测量（避闪），服务端降级为普通 effect（不执行）。
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function PagerButton({
  active = false,
  hasPill = false,
  disabled,
  "aria-label": ariaLabel,
  ariaCurrent,
  onClick,
  innerRef,
  children,
}: {
  active?: boolean;
  // 滑块已就绪（已测量）：选中态改由滑块供蓝底，按钮自身转 ghost；
  // 未就绪（SSR/首帧/jsdom）时退回 solid 自填，避免「白字白底」不可见。
  hasPill?: boolean;
  disabled?: boolean;
  "aria-label": string;
  ariaCurrent?: "page";
  onClick: () => void;
  innerRef?: (el: HTMLButtonElement | null) => void;
  children: ReactNode;
}) {
  return (
    <button
      ref={innerRef}
      type="button"
      className={cn(
        buttonVariants({ variant: active && !hasPill ? "solid" : "ghost", size: "sm" }),
        SQUARE,
        PRESS,
        "relative z-10",
        // 选中且滑块就绪：按钮转 ghost（深色字），被自带白字的滑块完整遮住——
        // 蓝底与白字同属滑块、永远同步，不会出现「黑字蓝底」或「白字白底」的时间差。
      )}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Pagination({
  page,
  total,
  onPageChange,
  siblingCount = 1,
  showFirstLast = false,
  disabled = false,
  className,
  "aria-label": ariaLabel = "pagination",
  ...props
}: PaginationProps) {
  const totalPages = Math.max(1, Math.trunc(total));
  const current = Math.min(Math.max(Math.trunc(page), 1), totalPages);
  const items = getPaginationRange({ page: current, total: totalPages, siblingCount });

  const navRef = useRef<HTMLElement>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  // 测量当前页按钮几何 → 驱动滑块。nav 为 offsetParent，故 offsetLeft 即相对 nav 的水平位移。
  // jsdom 下 offsetWidth=0 → width 守卫使滑块不渲染、选中态退回 solid。
  const measure = useCallback(() => {
    const el = activeRef.current;
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [current, totalPages, siblingCount, showFirstLast, disabled]);

  useIsoLayoutEffect(() => {
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [measure]);

  const hasPill = !!(indicator && indicator.width > 0);
  const pillStyle: CSSProperties = indicator
    ? {
        width: indicator.width,
        transform: `translateX(${indicator.left}px)`,
        transitionProperty: "transform, width",
        transitionDuration: motionDurationCss.base,
        transitionTimingFunction: motionEaseCss.out,
      }
    : {};

  const go = (p: number) => {
    const next = Math.min(Math.max(p, 1), totalPages);
    if (next !== current) onPageChange(next);
  };

  const atFirst = current <= 1;
  const atLast = current >= totalPages;

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      className={cn("relative flex items-center gap-1.5", className)}
      {...props}
    >
      {/* 选中滑块：测好的 left/width 经 CSS transition 平滑滑动（复用 Segmented 技法）。
          自带白色页码（z-20 盖住下方按钮的深色字）——蓝底与白字同属一个元素、永远同步，
          避免「黑字蓝底」的时间差。未测量(width=0)前不渲染，选中态由 PagerButton 的 solid 兜底。
          pointer-events-none：点击穿透到下方按钮；aria-hidden：读屏只读真实按钮。 */}
      {hasPill && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-20 flex h-9 items-center justify-center rounded-[var(--radius)] bg-primary text-sm font-medium text-primary-foreground shadow-sm"
          style={pillStyle}
        >
          {current}
        </span>
      )}
      {showFirstLast && (
        <PagerButton aria-label="跳到首页" hasPill={hasPill} disabled={disabled || atFirst} onClick={() => go(1)}>
          <ChevronsLeft className="size-4" aria-hidden />
        </PagerButton>
      )}
      <PagerButton aria-label="上一页" hasPill={hasPill} disabled={disabled || atFirst} onClick={() => go(current - 1)}>
        <ChevronLeft className="size-4" aria-hidden />
      </PagerButton>

      {items.map((item, i) =>
        item === "ellipsis" ? (
          <span
            key={`e${i}`}
            className="relative z-10 inline-flex h-9 min-w-9 select-none items-center justify-center text-muted"
          >
            <span aria-hidden="true">…</span>
            <span className="sr-only">更多页面</span>
          </span>
        ) : (
          <PagerButton
            key={item}
            active={item === current}
            hasPill={hasPill}
            innerRef={
              item === current
                ? (el) => {
                    activeRef.current = el;
                  }
                : undefined
            }
            aria-label={`第 ${item} 页`}
            ariaCurrent={item === current ? "page" : undefined}
            disabled={disabled}
            onClick={() => go(item)}
          >
            {item}
          </PagerButton>
        ),
      )}

      <PagerButton aria-label="下一页" hasPill={hasPill} disabled={disabled || atLast} onClick={() => go(current + 1)}>
        <ChevronRight className="size-4" aria-hidden />
      </PagerButton>
      {showFirstLast && (
        <PagerButton aria-label="跳到末页" hasPill={hasPill} disabled={disabled || atLast} onClick={() => go(totalPages)}>
          <ChevronsRight className="size-4" aria-hidden />
        </PagerButton>
      )}
    </nav>
  );
}
