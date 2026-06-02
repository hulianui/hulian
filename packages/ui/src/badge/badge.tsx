import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { BadgeProps } from "./badge.types";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full font-medium",
  {
    variants: {
      variant: { solid: "", soft: "", outline: "border" },
      tone: { brand: "", danger: "", neutral: "" },
      size: {
        sm: "h-5 px-2 text-[11px]",
        md: "h-6 px-2.5 text-xs",
      },
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
    defaultVariants: { variant: "solid", tone: "brand", size: "md" },
  },
);

export function Badge({ className, variant, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, tone, size }), className)} {...props} />;
}
