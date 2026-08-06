"use client";
import { memo } from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Minus, Plus } from "../_icons";
import { cn } from "../lib/cn";
import type { NumberFieldProps } from "./number-field.types";
import { useComponentLocale } from "../config/locale-context";

// 外壳复刻 Input 家风（focus-within ring）；±按钮居两侧；Input 居中 tabular-nums。
// 键盘 ↑↓/PageUp/Down/Home/End + 到达 min/max 时按钮自动禁用，全由 Base UI 兜底。
// select-none：±按钮内是 SVG 图标无文本，双击/连点时浏览器会把选区蔓延到附近整块(整个 Playground)，故禁选。
// Input 不加，保留数字可选。
const btnClass =
  "inline-flex size-9 shrink-0 select-none items-center justify-center text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

function NumberFieldImpl({
  className,
  "aria-label": ariaLabel,
  onValueChange,
  ...props
}: NumberFieldProps) {
  const labels = useComponentLocale().numberField ?? { decrement: "减少", increment: "增加" };
  return (
    <BaseNumberField.Root
      {...props}
      onValueChange={onValueChange ? (v) => onValueChange(v) : undefined}
      className={className}
    >
      <BaseNumberField.Group
        className={cn(
          // max-w-full：外部 className 给的宽度（如 w-32）小于内容固有宽时，夹住自身不溢出容器；
          // 配合 Input 的 min-w-0 flex-1，多余/不足的宽度都由中间输入框吸收，±按钮恒定 size-9。
          "inline-flex max-w-full items-center overflow-hidden rounded-[var(--radius)] border border-border bg-surface",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-bg",
          "data-[disabled]:opacity-50",
        )}
      >
        <BaseNumberField.Decrement
          className={cn(btnClass, "border-r border-border")}
          aria-label={labels.decrement}
        >
          <Minus className="size-4" />
        </BaseNumberField.Decrement>
        <BaseNumberField.Input
          aria-label={ariaLabel}
          className="h-9 w-16 min-w-0 flex-1 bg-transparent text-center text-sm tabular-nums text-foreground outline-none"
        />
        <BaseNumberField.Increment
          className={cn(btnClass, "border-l border-border")}
          aria-label={labels.increment}
        >
          <Plus className="size-4" />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
}
NumberFieldImpl.displayName = "NumberField";

// 数量/价格字段常成排落在同一张表单里，父级一动就整排重算。props 全是原语时
// React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const NumberField = memo(NumberFieldImpl);
NumberField.displayName = "NumberField";
