"use client";
import { cva } from "class-variance-authority";
import { X } from "../_icons";
import { useComponentLocale } from "../config/locale";
import { cn } from "../lib/cn";
import type { TagProps, TagTone } from "./tag.types";

// Tag = 状态标签（区别于 Badge 计数 / Chip 令牌）：5 语气覆盖状态光谱 + 可呼吸状态圆点 + 可关闭。
// 圆角用比 Badge/Chip(pill) 更小的矩形，强化「状态标记」语义。纯消费语义 token。
export const tagVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-[calc(var(--radius)-0.25rem)] font-medium",
  {
    variants: {
      variant: { soft: "", solid: "", outline: "border" },
      tone: { neutral: "", brand: "", success: "", warning: "", danger: "" },
      size: {
        sm: "h-5 px-1.5 text-[11px]",
        md: "h-6 px-2 text-xs",
      },
    },
    compoundVariants: [
      { variant: "soft", tone: "neutral", class: "bg-surface-hover text-muted" },
      { variant: "soft", tone: "brand", class: "bg-primary/12 text-primary" },
      { variant: "soft", tone: "success", class: "bg-success/12 text-success" },
      { variant: "soft", tone: "warning", class: "bg-warning/12 text-warning" },
      { variant: "soft", tone: "danger", class: "bg-danger/12 text-danger" },
      { variant: "solid", tone: "neutral", class: "bg-surface-hover text-foreground" },
      { variant: "solid", tone: "brand", class: "bg-primary text-primary-foreground" },
      { variant: "solid", tone: "success", class: "bg-success text-success-foreground" },
      { variant: "solid", tone: "warning", class: "bg-warning text-warning-foreground" },
      { variant: "solid", tone: "danger", class: "bg-danger text-danger-foreground" },
      { variant: "outline", tone: "neutral", class: "border-border text-foreground" },
      { variant: "outline", tone: "brand", class: "border-primary text-primary" },
      { variant: "outline", tone: "success", class: "border-success text-success" },
      { variant: "outline", tone: "warning", class: "border-warning text-warning" },
      { variant: "outline", tone: "danger", class: "border-danger text-danger" },
    ],
    defaultVariants: { variant: "soft", tone: "neutral", size: "md" },
  },
);

const dotByTone: Record<TagTone, string> = {
  neutral: "bg-muted",
  brand: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function Tag({
  variant,
  tone = "neutral",
  size = "md",
  dot,
  pulse,
  icon,
  onClose,
  isDisabled,
  className,
  children,
}: TagProps) {
  const labels = { remove: "移除", ...useComponentLocale().tag };
  return (
    <span
      className={cn(
        tagVariants({ variant, tone, size }),
        isDisabled && "pointer-events-none opacity-50",
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      {icon ? (
        <span className="flex shrink-0 items-center [&>svg]:size-3">{icon}</span>
      ) : (
        dot && (
          <span className="relative flex size-1.5 shrink-0 items-center justify-center">
            {pulse && (
              <span
                className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60", dotByTone[tone])}
                aria-hidden
              />
            )}
            <span className={cn("relative inline-flex size-1.5 rounded-full", dotByTone[tone])} aria-hidden />
          </span>
        )
      )}
      {children}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          disabled={isDisabled}
          aria-label={labels.remove}
          className="-mr-0.5 inline-flex size-3.5 items-center justify-center rounded-full opacity-60 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
        >
          <X className="size-2.5" />
        </button>
      )}
    </span>
  );
}
