"use client";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale";
import type { CouponProps, CouponStatus, CouponTone } from "./coupon.types";

// Coupon = 撕票造型优惠券。左侧面额区(tone 实色) + 中缝虚线撕边/上下半圆穿孔 + 右侧信息/操作区。
// 穿孔用 bg-[var(--coupon-notch)]（默认页底色）的两个圆叠在中缝端点，营造「凿穿」轮廓；
// 纯 CSS、只消费语义 token。不可由现有组件干净拼出 → 独立原语。"use client" 因含领取/使用交互。

const tonePanel: Record<CouponTone, string> = {
  brand: "bg-gradient-to-br from-primary to-primary-hover text-primary-foreground",
  danger: "bg-gradient-to-br from-danger to-danger text-danger-foreground",
  neutral: "bg-surface-hover text-foreground",
};

const toneText: Record<CouponTone, string> = {
  brand: "text-primary",
  danger: "text-danger",
  neutral: "text-foreground",
};

// 左侧面板宽度（与穿孔/中缝定位的 left 偏移强绑定）。
const PANEL = { sm: "w-20", md: "w-28" } as const;
const PANEL_LEFT = { sm: "left-20", md: "left-28" } as const;
const HEIGHT = { sm: "min-h-20", md: "min-h-24" } as const;

function Denomination({
  kind,
  amount,
  discount,
  threshold,
  size,
  discountSuffix,
  freeShipping,
}: Pick<CouponProps, "kind" | "amount" | "discount" | "threshold" | "size"> & {
  discountSuffix: string;
  freeShipping: string;
}) {
  const big = size === "sm" ? "text-2xl" : "text-3xl";
  if (kind === "discount") {
    return (
      <div className="flex items-baseline font-bold leading-none">
        <span className={big}>{discount}</span>
        <span className="ml-0.5 text-sm font-semibold">{discountSuffix}</span>
      </div>
    );
  }
  if (kind === "shipping") {
    return <div className={cn("font-bold leading-none", size === "sm" ? "text-lg" : "text-xl")}>{freeShipping}</div>;
  }
  return (
    <div className="flex items-baseline font-bold leading-none">
      <span className="mr-0.5 text-sm font-semibold">¥</span>
      <span className={big}>{amount}</span>
    </div>
  );
}

export function Coupon({
  kind = "amount",
  amount,
  discount,
  threshold,
  title,
  scope,
  validUntil,
  status = "available",
  tone = "brand",
  size = "md",
  shine,
  selected,
  onClaim,
  onUse,
  actionLabel,
  onSelect,
  className,
}: CouponProps) {
  const labels = useComponentLocale().coupon ?? {
    available: "立即领取",
    claimed: "去使用",
    used: "已使用",
    expired: "已过期",
    noMinimumSpend: "无门槛",
    minimumSpend: (amount: number) => `满${amount}可用`,
    discountSuffix: "折",
    freeShipping: "包邮",
  };
  const inactive = status === "used" || status === "expired";
  const thresholdText =
    kind === "shipping" ? labels.noMinimumSpend : threshold ? labels.minimumSpend(threshold) : labels.noMinimumSpend;
  const action = status === "available" ? onClaim : status === "claimed" ? onUse : undefined;
  const label = actionLabel ?? labels[status];

  return (
    <div
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect && !inactive ? 0 : undefined}
      aria-pressed={onSelect ? !!selected : undefined}
      onClick={onSelect && !inactive ? onSelect : undefined}
      onKeyDown={
        onSelect && !inactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      className={cn(
        // 对齐项目 elevated 卡片的描边+阴影（resting shadow-sm，selected 时 border-primary 经 twMerge 覆盖）
        "relative isolate flex overflow-hidden rounded-xl border border-hairline bg-surface text-left shadow-sm",
        HEIGHT[size],
        selected && "border-primary ring-2 ring-ring",
        inactive && "opacity-60 grayscale",
        onSelect && !inactive && "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {/* 左：面额区 */}
      <div
        className={cn(
          "relative flex shrink-0 flex-col items-center justify-center gap-1 overflow-hidden px-2",
          PANEL[size],
          tonePanel[tone],
        )}
      >
        {/* 扫光高光带：仅可领/可用券播放，已用/过期不播；纯装饰不挡指针 */}
        {shine && !inactive && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent"
            style={{ animation: "hulian-coupon-shine 3.4s ease-in-out infinite" }}
          />
        )}
        <Denomination
          kind={kind}
          amount={amount}
          discount={discount}
          threshold={threshold}
          size={size}
          discountSuffix={labels.discountSuffix}
          freeShipping={labels.freeShipping}
        />
        <span className="text-center text-[11px] leading-tight opacity-90">{thresholdText}</span>
      </div>

      {/* 中缝：虚线 + 上下半圆穿孔（穿孔色 = 页底色，营造凿穿） */}
      <span
        aria-hidden
        className={cn(
          "absolute top-2 bottom-2 -translate-x-1/2 border-l border-dashed border-border",
          PANEL_LEFT[size],
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute -top-2 size-4 -translate-x-1/2 rounded-full bg-[var(--coupon-notch,var(--color-bg))]",
          PANEL_LEFT[size],
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute -bottom-2 size-4 -translate-x-1/2 rounded-full bg-[var(--coupon-notch,var(--color-bg))]",
          PANEL_LEFT[size],
        )}
      />

      {/* 右：信息 + 操作 */}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 py-2 pl-4 pr-3">
        <div className="min-w-0">
          <div className={cn("truncate font-semibold", size === "sm" ? "text-sm" : "text-[15px]")}>
            {title}
          </div>
          {scope && <div className="mt-0.5 truncate text-xs text-muted">{scope}</div>}
          {validUntil && <div className="mt-0.5 truncate text-[11px] text-muted">{validUntil}</div>}
        </div>

        <div className="shrink-0">
          {action && !inactive ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                action();
              }}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                status === "available"
                  ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                  : cn("border", toneText[tone], "border-current hover:bg-surface-hover"),
              )}
            >
              {label}
            </button>
          ) : (
            <span className="text-xs font-medium text-muted">{label}</span>
          )}
        </div>
      </div>
    </div>
  );
}
