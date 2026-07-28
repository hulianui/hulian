"use client";
import { Input as BaseInput } from "@base-ui/react/input";
import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "../lib/cn";
import type { InputProps } from "./input.types";

// 外壳承载视觉：border/bg/圆角/focus-ring/invalid/disabled。内层 Base Input 透明。
// invalid 两条驱动路统一在 has-[[data-invalid]]：
//   · Field 内 → Field.Root invalid 让控件得 data-invalid
//   · 独立 → 下面把 invalid 翻译成 data-invalid 落到内层 input
export const inputShellVariants = cva(
  [
    "inline-flex w-full items-center gap-2 rounded-[var(--radius)] border border-border bg-surface text-foreground transition-colors",
    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-bg",
    "has-[[data-invalid]]:border-danger has-[[data-invalid]]:focus-within:ring-danger",
    "has-[:disabled]:opacity-50 has-[:disabled]:pointer-events-none",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-2.5 text-sm",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-3.5 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

// ref 转发到真正的 <input>（不是外壳 span）：focus()/select()/取 .value、以及 react-hook-form
// 的 register() 都指望拿到原生控件。此前不转发，消费方只能「受控值 + 包一层容器查询 DOM」绕。
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, size, invalid, prefix, suffix, ...props },
  ref,
) {
  return (
    <span className={cn(inputShellVariants({ size }), className)}>
      {prefix != null && <span className="shrink-0 text-muted">{prefix}</span>}
      <BaseInput
        ref={ref}
        {...props}
        {...(invalid && { "data-invalid": "", "aria-invalid": true })}
        className="w-full bg-transparent text-foreground outline-none placeholder:text-muted disabled:cursor-not-allowed"
      />
      {suffix != null && <span className="shrink-0 text-muted">{suffix}</span>}
    </span>
  );
});
