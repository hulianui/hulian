"use client";
import { useState } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { Calendar as CalendarIcon, X } from "../_icons";
import { Calendar } from "../calendar";
import { PICKER_FORMAT, PICKER_PLACEHOLDER, parseValue } from "../calendar/calendar-core";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { DatePickerProps } from "./date-picker.types";

// 零依赖单日期选择器：触发器 + Base UI Popover + 常驻面板组件 <Calendar>。
// 面板本身（三层下钻、禁用判定、今天快捷）全在 Calendar 里，这里只管
// 「显示什么、什么时候开合、怎么清空」—— 与 DateRangePicker 同源（共用 lib/date）。

// 与 popover.tsx 同款：transition 简写避免与 Base UI 内联长写混用触发 React shorthand 警告。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

export function DatePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  picker = "date",
  minDate,
  maxDate,
  disabledDate,
  placeholder,
  displayFormat,
  clearable = true,
  showToday = true,
  disabled,
  readOnly,
  "aria-label": ariaLabel,
  className,
}: DatePickerProps) {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState<string | null>(defaultValue ?? null);
  const value = isControlled ? (valueProp ?? null) : internal;
  const selected = parseValue(value, picker);

  const [open, setOpen] = useState(false);

  function commit(next: string | null) {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  function handleOpenChange(next: boolean) {
    if (disabled) return;
    setOpen(next);
  }

  function clearValue(e: React.MouseEvent) {
    e.stopPropagation();
    commit(null);
  }

  const text = selected ? selected.format(displayFormat ?? PICKER_FORMAT[picker]) : "";
  const showClear = clearable && value != null && !disabled && !readOnly;

  return (
    <BasePopover.Root open={open} onOpenChange={handleOpenChange}>
      <div className={cn("relative inline-flex", className)}>
        <BasePopover.Trigger
          render={
            <button
              type="button"
              disabled={disabled}
              aria-label={ariaLabel}
              className={cn(
                "inline-flex h-9 min-w-[10rem] items-center gap-2 rounded-[var(--radius)] border border-border bg-bg px-3 text-sm text-foreground outline-none transition-colors",
                "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30",
                "disabled:cursor-not-allowed disabled:opacity-50",
                showClear && "pr-8",
              )}
            >
              <CalendarIcon className="size-4 shrink-0 text-muted" aria-hidden />
              <span className={cn("truncate", !text && "text-muted")}>
                {text || placeholder || PICKER_PLACEHOLDER[picker]}
              </span>
            </button>
          }
        />
        {showClear && (
          <button
            type="button"
            aria-label="清除"
            onClick={clearValue}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <BasePopover.Portal>
        <BasePopover.Positioner side="bottom" align="start" sideOffset={8} className="z-50">
          <BasePopover.Popup
            className={cn(
              "rounded-[var(--radius)] border border-hairline bg-surface p-3 text-foreground shadow-xl outline-none",
              "origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            )}
            style={overlayTransition}
          >
            {/*
              面板每次开合都随 Popup 挂卸，所以 cursor / view 天然回到「对齐当前值」的初态，
              不需要再在 onOpenChange 里手动重置。
              选中即关：Calendar 只在真正提交那一层才回调（下钻不回调），直接关掉是对的。
            */}
            <Calendar
              value={value}
              onValueChange={(next) => {
                commit(next);
                setOpen(false);
              }}
              picker={picker}
              minDate={minDate}
              maxDate={maxDate}
              disabledDate={disabledDate}
              showToday={showToday}
              readOnly={readOnly}
            />
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
