"use client";
// 纯皮肤分页器：受控（page + onPageChange）；页码区间走纯函数 getPaginationRange。
// 页码/上下页按钮复用 Button 气质（hover/focus-ring/disabled/press），覆写为定方形。
// 当前页 aria-current="page" + solid 填充；省略号为不可点装饰位。
// 含 onClick 交互回调 → 必 "use client"（区别于纯链接的 Breadcrumb）。
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "../button";
import { cn } from "../lib/cn";
import { getPaginationRange } from "./pagination.range";
import type { PaginationProps } from "./pagination.types";

// 方块按钮：复用 Button 的 focus-ring/disabled/press，仅覆写尺寸为定高、多位数可横向生长。
const SQUARE = "h-9 min-w-9 px-1.5";

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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={SQUARE}
          aria-label="跳到首页"
          disabled={disabled || atFirst}
          onClick={() => go(1)}
        >
          <ChevronsLeft className="size-4" aria-hidden />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={SQUARE}
        aria-label="上一页"
        disabled={disabled || atFirst}
        onClick={() => go(current - 1)}
      >
        <ChevronLeft className="size-4" aria-hidden />
      </Button>

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
          <Button
            key={item}
            type="button"
            variant={item === current ? "solid" : "ghost"}
            size="sm"
            className={SQUARE}
            aria-label={`第 ${item} 页`}
            aria-current={item === current ? "page" : undefined}
            disabled={disabled}
            onClick={() => go(item)}
          >
            {item}
          </Button>
        ),
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={SQUARE}
        aria-label="下一页"
        disabled={disabled || atLast}
        onClick={() => go(current + 1)}
      >
        <ChevronRight className="size-4" aria-hidden />
      </Button>
      {showFirstLast && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={SQUARE}
          aria-label="跳到末页"
          disabled={disabled || atLast}
          onClick={() => go(totalPages)}
        >
          <ChevronsRight className="size-4" aria-hidden />
        </Button>
      )}
    </nav>
  );
}
