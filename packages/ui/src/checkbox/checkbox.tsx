"use client";
import { Checkbox as BaseCheckbox } from "@base-ui-components/react/checkbox";
import { cn } from "../lib/cn";
import type { CheckboxProps } from "./checkbox.types";

// 方盒皮肤：复用 Switch 配方（data-[checked] 驱动 + focus-visible:ring + 语义 token）。
// disabled 用 data-[disabled]（Root 是 span，不是 button → :disabled 伪类不命中）。
const boxClass = cn(
  "size-5 shrink-0 grid place-items-center rounded-[var(--radius)] border border-border bg-surface text-primary-foreground transition-colors outline-none",
  "data-[checked]:bg-primary data-[checked]:border-primary",
  "data-[indeterminate]:bg-primary data-[indeterminate]:border-primary",
  "data-[invalid]:border-danger",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
);

function CheckIcon() {
  return (
    <svg data-icon="check" viewBox="0 0 16 16" fill="none" aria-hidden className="size-3.5">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DashIcon() {
  return (
    <svg data-icon="dash" viewBox="0 0 16 16" fill="none" aria-hidden className="size-3.5">
      <path d="M3.5 8h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Checkbox({ className, label, disabled, ...props }: CheckboxProps) {
  const box = (
    <BaseCheckbox.Root disabled={disabled} {...props} className={cn(boxClass, className)}>
      <BaseCheckbox.Indicator
        render={(indicatorProps, state) => (
          <span {...(indicatorProps as React.HTMLAttributes<HTMLSpanElement>)}>
            {state.indeterminate ? <DashIcon /> : <CheckIcon />}
          </span>
        )}
      />
    </BaseCheckbox.Root>
  );

  if (!label) return box;

  return (
    <label className="inline-flex items-center gap-2">
      {box}
      <span className={cn("text-sm text-foreground select-none", disabled && "opacity-50")}>{label}</span>
    </label>
  );
}
