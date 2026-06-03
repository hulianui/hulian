import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { SpinnerProps } from "./spinner.types";

// 纯皮肤(无 Base UI/无 hook → 可 RSC，照 badge/breadcrumb)：SVG 双层环(底环 opacity-20 + 旋转弧)，
// stroke=currentColor 吃 tone 色，animate-spin 纯 CSS。role=status + aria-label。
export const spinnerVariants = cva("inline-block", {
  variants: {
    size: { sm: "size-4", md: "size-6", lg: "size-8" },
    tone: { primary: "text-primary", current: "text-current", muted: "text-muted" },
  },
  defaultVariants: { size: "md", tone: "primary" },
});

export function Spinner({ size, tone, label = "加载中", className }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn(spinnerVariants({ size, tone }), className)}>
      <svg viewBox="0 0 24 24" fill="none" className="size-full animate-spin">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}
