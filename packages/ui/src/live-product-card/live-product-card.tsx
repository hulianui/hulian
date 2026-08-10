"use client";
import { memo } from "react";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import type { LiveProductCardProps } from "./live-product-card.types";

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function LiveProductCardImpl({
  index,
  image,
  title,
  price,
  originalPrice,
  explaining,
  stock,
  sold,
  tag,
  action,
  currency = "¥",
  layout = "row",
  onClick,
  className,
}: LiveProductCardProps) {
  const labels = useComponentLocale().liveProductCard ?? {
    presenting: "讲解中",
    sold: (count: number) => `已售 ${count}`,
    remaining: (count: number) => `仅剩 ${count}`,
  };
  const isCard = layout === "card";

  const Price = (
    <div className="flex items-baseline gap-1.5">
      <span className="text-danger">
        <span className="text-xs">{currency}</span>
        <span className="text-lg font-bold tabular-nums">{fmt(price)}</span>
      </span>
      {originalPrice != null && originalPrice > price && (
        <span className="text-xs text-muted-foreground line-through">
          {currency}
          {fmt(originalPrice)}
        </span>
      )}
    </div>
  );

  const Thumb = (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-[var(--radius)]",
        isCard ? "aspect-square w-full" : "size-16",
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" className="size-full object-cover" />
      {index != null && (
        <span className="absolute left-0 top-0 rounded-br-md bg-chart-4 px-1.5 text-[11px] font-bold text-white">
          {index}
        </span>
      )}
      {explaining && (
        <span className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 bg-danger/90 py-0.5 text-[10px] font-medium text-danger-foreground">
          <span className="size-1 animate-pulse rounded-full bg-white" />
          {labels.presenting}
        </span>
      )}
    </div>
  );

  return (
    <div
      onClick={onClick}
      className={cn(
        "border border-border bg-surface text-foreground",
        "rounded-[var(--radius)]",
        isCard ? "flex flex-col gap-2 p-2" : "flex items-center gap-3 p-2",
        onClick && "cursor-pointer transition hover:border-primary/50",
        className,
      )}
    >
      {Thumb}
      <div className={cn("min-w-0 flex-1", isCard && "w-full")}>
        <div className="flex items-start gap-1">
          {tag && (
            <span className="shrink-0 rounded bg-danger/15 px-1 text-[10px] font-medium leading-4 text-danger">
              {tag}
            </span>
          )}
          <div className="line-clamp-2 text-sm leading-snug">{title}</div>
        </div>
        <div className="mt-1 flex items-end justify-between gap-2">
          <div>
            {Price}
            {(stock != null || sold != null) && (
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {sold != null && <span>{labels.sold(sold)}</span>}
                {sold != null && stock != null && <span> · </span>}
                {stock != null && <span>{labels.remaining(stock)}</span>}
              </div>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </div>
  );
}
LiveProductCardImpl.displayName = "LiveProductCard";

// 直播商品卡永远是成列表出现的，而它所在的页面（弹幕、在线人数、倒计时）每秒都在更新——
// 父级一动整列重算。props 全是原语时 React 无法自己 bailout，只能靠 memo。
export const LiveProductCard = memo(LiveProductCardImpl);
LiveProductCard.displayName = "LiveProductCard";
