"use client";
import { memo } from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { cn } from "../lib/cn";
import type { CheckboxProps } from "./checkbox.types";

// 方盒皮肤：复用 Switch 配方（data-[checked] 驱动 + focus-visible:ring + 语义 token）。
// disabled 用 data-[disabled]（Root 是 span，不是 button → :disabled 伪类不命中）。
const boxClass = cn(
  // 圆角封顶 0.375rem：--radius=0.625rem(10px) 落到 20px 方盒会变正圆、与 radio 混淆 → min() 钉死方盒
  "shrink-0 grid place-items-center rounded-[min(var(--radius),0.375rem)] border border-border bg-surface text-primary-foreground transition-colors outline-none",
  "data-[checked]:bg-primary data-[checked]:border-primary",
  "data-[indeterminate]:bg-primary data-[indeterminate]:border-primary",
  "data-[invalid]:border-danger",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed",
);

// 三档尺寸联动（#199）：勾号跟着方盒缩放。勾号此前独立写死 14px，方盒一压到 16px 就顶满，
// 于是密集表格里每个勾选框都被迫比原设计大一圈——这才是「只有一个尺寸」的真正成因。
const boxSizeClass = { sm: "size-4", md: "size-5" } as const;
const iconSizeClass = { sm: "size-3", md: "size-3.5" } as const;
const labelSizeClass = { sm: "text-xs", md: "text-sm" } as const;

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg data-icon="check" viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function DashIcon({ className }: { className?: string }) {
  return (
    <svg data-icon="dash" viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M3.5 8h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckboxImpl({
  className,
  label,
  children,
  disabled,
  size = "md",
  labelClassName,
  ...props
}: CheckboxProps) {
  // children 与 label 等价（#183）：同 Radio，此前 children 会被 Root 上显式的 Indicator 盖掉，
  // 类型放行但一个字都不渲染。
  const text = label ?? children;
  const box = (
    <BaseCheckbox.Root
      disabled={disabled}
      {...props}
      className={cn(boxClass, boxSizeClass[size], className)}
    >
      <BaseCheckbox.Indicator
        render={(indicatorProps, state) => (
          <span {...(indicatorProps as React.HTMLAttributes<HTMLSpanElement>)}>
            {state.indeterminate ? (
              <DashIcon className={iconSizeClass[size]} />
            ) : (
              <CheckIcon className={iconSizeClass[size]} />
            )}
          </span>
        )}
      />
    </BaseCheckbox.Root>
  );

  if (text == null || text === false || text === "") return box;

  return (
    <label className="inline-flex items-center gap-2">
      {box}
      <span
        className={cn(
          labelSizeClass[size],
          "text-foreground select-none",
          disabled && "opacity-50",
          labelClassName,
        )}
      >
        {text}
      </span>
    </label>
  );
}

export const Checkbox = memo(CheckboxImpl);
Checkbox.displayName = "Checkbox";
