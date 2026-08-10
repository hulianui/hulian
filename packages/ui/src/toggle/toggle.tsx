"use client";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { pressableClass } from "../motion";
import type { ToggleProps, ToggleGroupProps } from "./toggle.types";

// Toggle 渲 <button>（aria-pressed），故 :disabled 伪类可用、data-[pressed] 标选中态。
// pressableClass 平替原 transition-colors：它自带含颜色项的 transition-property 列表，
// 顺带补上按下缩放（可按压元素必须对按压有即时反应）。
export const toggleVariants = cva(
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] font-medium ${pressableClass} outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none`,
  {
    variants: {
      variant: {
        // soft 选中：surface-hover 底（明暗都可读），不抢主色
        default:
          "text-muted-foreground hover:bg-surface-hover hover:text-foreground data-[pressed]:bg-surface-hover data-[pressed]:text-foreground",
        // 实心选中：主色填充
        outline:
          "border border-border bg-surface text-foreground hover:bg-surface-hover data-[pressed]:border-primary data-[pressed]:bg-primary data-[pressed]:text-primary-foreground",
        // 圆角描边 chip，选中 = soft 主色（AI 工具栏「深度思考/智能搜索」式开关）
        pill: "rounded-full border border-border font-normal text-muted-foreground hover:bg-surface-hover hover:text-foreground data-[pressed]:border-primary/40 data-[pressed]:bg-primary/10 data-[pressed]:text-primary",
      },
      size: {
        sm: "h-8 min-w-8 px-2.5 text-sm",
        md: "h-10 min-w-10 px-3 text-sm",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export function Toggle({ className, variant, size, ...props }: ToggleProps) {
  return <BaseToggle {...props} className={cn(toggleVariants({ variant, size }), className)} />;
}

export function ToggleGroup({
  className,
  multiple,
  value,
  defaultValue,
  onValueChange,
  orientation,
  disabled,
  children,
}: ToggleGroupProps) {
  return (
    <BaseToggleGroup
      multiple={multiple}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange ? (v) => onValueChange(v as string[]) : undefined}
      orientation={orientation}
      disabled={disabled}
      className={cn(
        "inline-flex gap-1 rounded-[var(--radius)] border border-border bg-surface p-1",
        "data-[orientation=vertical]:flex-col",
        className,
      )}
    >
      {children}
    </BaseToggleGroup>
  );
}
