"use client";
// 纯皮肤分页器：受控（page + onPageChange）；页码区间走纯函数 getPaginationRange。
// 页码/箭头复用 Button 的 buttonVariants 皮肤（hover/focus-ring/disabled），但用原生 <button>：
// 分页是密集按钮列，current 改变会整列 variant 切换 + re-render，若每个都是 motion.button，
// 多个 whileTap 弹簧同时重评估会让 active 切换抖动/卡顿。改纯 CSS press（active:scale）后，
// 切换只改 class，走浏览器合成层的 transition，丝滑无卡顿。
// 当前页 aria-current="page" + solid 填充；省略号为不可点装饰位。
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "../_icons";
import { buttonVariants } from "../button";
import { cn } from "../lib/cn";
import { getPaginationRange } from "./pagination.range";
import type { PaginationProps } from "./pagination.types";

// 方块按钮：复用 buttonVariants 的 focus-ring/disabled，仅覆写尺寸为定高、多位数可横向生长。
const SQUARE = "h-9 min-w-9 px-1.5";
// press 与颜色统一过渡：transform 走合成层；覆盖 buttonVariants 自带的 transition-colors。
const PRESS = "transition-[color,background-color,box-shadow,transform] duration-150 active:scale-[0.97]";

function PagerButton({
  active = false,
  disabled,
  "aria-label": ariaLabel,
  ariaCurrent,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  "aria-label": string;
  ariaCurrent?: "page";
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cn(
        buttonVariants({ variant: active ? "solid" : "ghost", size: "sm" }),
        SQUARE,
        PRESS,
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

  const go = (p: number) => {
    const next = Math.min(Math.max(p, 1), totalPages);
    if (next !== current) onPageChange(next);
  };

  const atFirst = current <= 1;
  const atLast = current >= totalPages;

  return (
    <nav aria-label={ariaLabel} className={cn("flex items-center gap-1.5", className)} {...props}>
      {showFirstLast && (
        <PagerButton aria-label="跳到首页" disabled={disabled || atFirst} onClick={() => go(1)}>
          <ChevronsLeft className="size-4" aria-hidden />
        </PagerButton>
      )}
      <PagerButton aria-label="上一页" disabled={disabled || atFirst} onClick={() => go(current - 1)}>
        <ChevronLeft className="size-4" aria-hidden />
      </PagerButton>

      {items.map((item, i) =>
        item === "ellipsis" ? (
          <span
            key={`e${i}`}
            className="inline-flex h-9 min-w-9 select-none items-center justify-center text-muted"
          >
            <span aria-hidden="true">…</span>
            <span className="sr-only">更多页面</span>
          </span>
        ) : (
          <PagerButton
            key={item}
            active={item === current}
            aria-label={`第 ${item} 页`}
            ariaCurrent={item === current ? "page" : undefined}
            disabled={disabled}
            onClick={() => go(item)}
          >
            {item}
          </PagerButton>
        ),
      )}

      <PagerButton aria-label="下一页" disabled={disabled || atLast} onClick={() => go(current + 1)}>
        <ChevronRight className="size-4" aria-hidden />
      </PagerButton>
      {showFirstLast && (
        <PagerButton aria-label="跳到末页" disabled={disabled || atLast} onClick={() => go(totalPages)}>
          <ChevronsRight className="size-4" aria-hidden />
        </PagerButton>
      )}
    </nav>
  );
}
