"use client";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import type { ChipProps } from "./chip.types";

// Chip = 可移除标签/令牌（比 Badge 大、可带 dot 与关闭按钮）。CVA 配方同 Badge tone/variant，
// 但 size 更大、含 onClose 交互（故 "use client"）。只消费语义 token。
export const chipVariants = cva("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium", {
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
    { variant: "soft", tone: "neutral", class: "bg-surface-hover text-muted" },
    { variant: "outline", tone: "brand", class: "border-primary text-primary" },
    { variant: "outline", tone: "danger", class: "border-danger text-danger" },
    { variant: "outline", tone: "neutral", class: "border-border text-foreground" },
  ],
  defaultVariants: { variant: "soft", tone: "brand", size: "md" },
});

const dotByTone = { brand: "bg-primary", danger: "bg-danger", neutral: "bg-muted" } as const;

export function Chip({ variant, tone = "brand", size, onClose, dot, className, children }: ChipProps) {
  return (
    <span className={cn(chipVariants({ variant, tone, size }), className)}>
      {dot && <span className={cn("size-1.5 rounded-full", dotByTone[tone])} aria-hidden />}
      {children}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="移除"
          className="-mr-1 inline-flex size-4 items-center justify-center rounded-full opacity-60 outline-none transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}
