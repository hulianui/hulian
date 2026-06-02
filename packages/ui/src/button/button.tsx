import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/cn";
import type { ButtonProps } from "./button.types";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline: "border border-border bg-surface text-foreground hover:bg-surface-hover",
        ghost: "text-foreground hover:bg-surface-hover",
      },
      tone: { brand: "", danger: "" },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    compoundVariants: [
      { variant: "solid", tone: "danger", class: "bg-danger text-danger-foreground hover:bg-danger" },
      { variant: "outline", tone: "danger", class: "border-danger text-danger" },
      { variant: "ghost", tone: "danger", class: "text-danger" },
    ],
    defaultVariants: { variant: "solid", tone: "brand", size: "md" },
  },
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, tone, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, tone, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
