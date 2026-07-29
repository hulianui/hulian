"use client";
import { createContext, useContext, useId, useState } from "react";
import { Check } from "../_icons";
import { cn } from "../lib/cn";
import { pressableClass } from "../motion";
import type { ChoiceboxGroupProps, ChoiceboxProps } from "./choicebox.types";

// Choicebox = 卡片化的单/多选（区别普通 Radio/Checkbox：每项是带标题/描述/图标的可点卡片，
// 用于套餐选择、支付方式、订阅档位等「重选项」场景）。
// 用隐藏的原生 <input radio|checkbox> 承载键盘与无障碍语义（单选同 name 自动方向键漫游、
// 多选空格切换），外层 <label> 换皮成卡片；受控/非受控两用。
interface ChoiceboxCtx {
  multiple: boolean;
  name: string;
  groupDisabled: boolean;
  isSelected: (value: string) => boolean;
  toggle: (value: string, checked: boolean) => void;
}
const ChoiceboxContext = createContext<ChoiceboxCtx | null>(null);

export function ChoiceboxGroup({
  value,
  defaultValue,
  onValueChange,
  multiple = false,
  name,
  columns = 1,
  disabled = false,
  className,
  children,
  "aria-label": ariaLabel,
}: ChoiceboxGroupProps) {
  const autoName = useId();
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string | string[]>(
    defaultValue ?? (multiple ? [] : ""),
  );
  const current = isControlled ? value! : internal;

  const setValue = (next: string | string[]) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  const isSelected = (v: string) =>
    multiple ? Array.isArray(current) && current.includes(v) : current === v;

  const toggle = (v: string, checked: boolean) => {
    if (multiple) {
      const arr = Array.isArray(current) ? current : [];
      setValue(checked ? [...arr, v] : arr.filter((x) => x !== v));
    } else {
      setValue(v);
    }
  };

  return (
    <ChoiceboxContext.Provider
      value={{ multiple, name: name ?? autoName, groupDisabled: disabled, isSelected, toggle }}
    >
      <div
        role={multiple ? "group" : "radiogroup"}
        aria-label={ariaLabel}
        className={cn("grid gap-3", disabled && "opacity-60", className)}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {children}
      </div>
    </ChoiceboxContext.Provider>
  );
}

export function Choicebox({
  value,
  title,
  description,
  icon,
  children,
  disabled: itemDisabled,
  className,
}: ChoiceboxProps) {
  const ctx = useContext(ChoiceboxContext);
  if (!ctx) throw new Error("Choicebox 必须置于 ChoiceboxGroup 内");
  const { multiple, name, groupDisabled, isSelected, toggle } = ctx;
  const selected = isSelected(value);
  const disabled = groupDisabled || itemDisabled;

  return (
    <label
      data-checked={selected ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        // 按下缩放刻意用 0.99 而非通用的 0.97：scale 会连带缩放子元素，整张卡（标题+描述+图标）
        // 缩 3% 位移量太大、像"跳一下"；大面积可按压元素 1% 就够表达"按到了"。
        "relative flex cursor-pointer items-start gap-3 rounded-[var(--radius)] border bg-surface p-4 outline-none",
        "transition-[scale,border-color,box-shadow,background-color] duration-150 ease-out active:scale-[0.99] motion-reduce:transition-none motion-reduce:active:scale-100",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-bg",
        selected
          ? "border-primary bg-primary/[0.06] shadow-sm"
          : "border-border hover:border-primary/40 hover:bg-surface-hover",
        disabled && "cursor-not-allowed opacity-50 hover:border-border hover:bg-surface",
        className,
      )}
    >
      {/* 隐藏原生 input：承载键盘/读屏语义；视觉全部交给卡片 */}
      <input
        type={multiple ? "checkbox" : "radio"}
        name={name}
        value={value}
        checked={selected}
        disabled={disabled}
        onChange={(e) => toggle(value, e.target.checked)}
        className="sr-only"
      />

      {icon != null && (
        <span className={cn("mt-0.5 shrink-0 [&>svg]:size-5", selected ? "text-primary" : "text-muted")}>
          {icon}
        </span>
      )}

      <div className="min-w-0 flex-1">
        {title != null && <div className="font-medium text-foreground">{title}</div>}
        {description != null && <div className="mt-0.5 text-sm text-muted">{description}</div>}
        {children}
      </div>

      {/* 选中指示：单选=实心点环 / 多选=对勾方框 */}
      <span
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center border transition-colors",
          multiple ? "rounded-[min(var(--radius),0.375rem)]" : "rounded-full",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
        )}
        aria-hidden
      >
        {selected &&
          (multiple ? (
            <Check className="size-3.5" strokeWidth={3} />
          ) : (
            <span className="size-2 rounded-full bg-current" />
          ))}
      </span>
    </label>
  );
}
