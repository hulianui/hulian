"use client";
import { memo } from "react";
import { cva } from "class-variance-authority";
import { X } from "../_icons";
import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import type { ChipProps } from "./chip.types";

// Chip = 可移除标签/令牌（比 Badge 大、可带 dot/头像/前后缀与关闭按钮）。CVA 配方同 Badge tone/variant，
// 但 size 更大、含 onClose 交互（故 "use client"）。只消费语义 token。
export const chipVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium",
  {
    variants: {
      variant: { solid: "", soft: "", outline: "border" },
      tone: { brand: "", danger: "", neutral: "" },
      size: { sm: "h-6 px-2.5 text-xs", md: "h-7 px-3 text-sm" },
    },
    compoundVariants: [
      { variant: "solid", tone: "brand", class: "bg-primary text-primary-foreground" },
      { variant: "solid", tone: "danger", class: "bg-danger text-danger-foreground" },
      { variant: "solid", tone: "neutral", class: "bg-surface-hover text-foreground" },
      { variant: "soft", tone: "brand", class: "bg-primary/12 text-primary" },
      { variant: "soft", tone: "danger", class: "bg-danger/12 text-danger" },
      { variant: "soft", tone: "neutral", class: "bg-surface-hover text-muted-foreground" },
      { variant: "outline", tone: "brand", class: "border-primary text-primary" },
      { variant: "outline", tone: "danger", class: "border-danger text-danger" },
      { variant: "outline", tone: "neutral", class: "border-border text-foreground" },
    ],
    defaultVariants: { variant: "soft", tone: "brand", size: "md" },
  },
);

const dotByTone = { brand: "bg-primary", danger: "bg-danger", neutral: "bg-muted-foreground" } as const;
// avatar 存在时缩小左内边距让头像贴边，并按 size 把头像约束为正方形。
const avatarPadBySize = { sm: "pl-0.5", md: "pl-1" } as const;
const avatarSizeBySize = { sm: "[&>*]:size-5", md: "[&>*]:size-6" } as const;

function ChipImpl({
  variant,
  tone = "brand",
  size = "md",
  onClose,
  dot,
  avatar,
  startContent,
  endContent,
  isDisabled,
  className,
  children,
}: ChipProps) {
  const labels = { remove: "移除", ...useComponentLocale().chip };
  return (
    <span
      className={cn(
        chipVariants({ variant, tone, size }),
        avatar && avatarPadBySize[size],
        isDisabled && "pointer-events-none opacity-50",
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      {avatar ? (
        <span className={cn("-ml-0.5 flex shrink-0 items-center", avatarSizeBySize[size])}>
          {avatar}
        </span>
      ) : startContent ? (
        <span className="flex shrink-0 items-center">{startContent}</span>
      ) : (
        dot && <span className={cn("size-1.5 rounded-full", dotByTone[tone])} aria-hidden />
      )}
      {children}
      {endContent && <span className="flex shrink-0 items-center">{endContent}</span>}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          disabled={isDisabled}
          aria-label={labels.remove}
          className="-mr-1 inline-flex size-4 items-center justify-center rounded-full opacity-60 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}
ChipImpl.displayName = "Chip";

// 标签常成组渲染（筛选条、令牌列表），父级一动就整排重算。props 全是原语时
// React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox 同一处方。
export const Chip = memo(ChipImpl);
Chip.displayName = "Chip";
