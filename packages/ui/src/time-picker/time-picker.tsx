"use client";
import { memo, useState } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cva } from "class-variance-authority";
import { Clock, X } from "../_icons";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { TimeColumn } from "./time-column";
import {
  buildOptions,
  clampTime,
  formatTime,
  isHourDisabled,
  isMinuteDisabled,
  isSecondDisabled,
  parseTime,
  snapToStep,
  type TimeParts,
} from "./time-picker-core";
import type { TimePickerProps } from "./time-picker.types";

// 零依赖时间选择器：Base UI Popover + 三列滚动候选（时/分/秒）。
// 库里此前只有 _mui/TimeField（分段键盘输入、无浮层、无 min/max/step），
// 想要 el-time-picker 那种「点开选」的体验就只能自己搓。
//
// 值是定宽 "HH:mm[:ss]" 文本而非 Date：定宽 → 字典序即时间序，范围比较直接比字符串，
// 也不会像 Date 那样被时区搅进来。

// 与 popover.tsx 同款：transition 简写避免与 Base UI 内联长写混用触发 React shorthand 警告。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

// 触发器刻度与 Input 外壳逐字一致（32/40/48）：时间选择器几乎总是和 Input/Select 并排落在
// 同一行表单里，任何自创档位都会当场露出高度差。min-w 是本组件的内容宽度，不随档位变。
const triggerVariants = cva(
  [
    "inline-flex min-w-[9rem] items-center gap-2 rounded-[var(--radius)] border border-border bg-bg text-foreground outline-none transition-colors",
    "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: { sm: "h-8 px-2.5 text-sm", md: "h-10 px-3 text-sm", lg: "h-12 px-3.5 text-base" },
    },
    defaultVariants: { size: "md" },
  },
);

const triggerIconVariants = cva("shrink-0 text-muted", {
  variants: { size: { sm: "size-3.5", md: "size-4", lg: "size-5" } },
  defaultVariants: { size: "md" },
});

function TimePickerImpl({
  value: valueProp,
  defaultValue,
  onValueChange,
  withSeconds = false,
  size = "md",
  minuteStep = 1,
  secondStep = 1,
  minTime,
  maxTime,
  placeholder,
  clearable = true,
  showNow = true,
  disabled,
  readOnly,
  "aria-label": ariaLabel,
  className,
}: TimePickerProps) {
  const locale = useComponentLocale().timePicker ?? {
    placeholder: "选择时间",
    clear: "清除",
    hour: "时",
    minute: "分",
    second: "秒",
    now: "此刻",
    confirm: "确定",
  };
  const resolvedPlaceholder = placeholder === undefined ? locale.placeholder : placeholder;
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState<string | null>(defaultValue ?? null);
  const value = isControlled ? valueProp ?? null : internal;
  const parsed = parseTime(value);

  const [open, setOpen] = useState(false);

  const hours = buildOptions(23, 1);
  const minutes = buildOptions(59, minuteStep);
  const seconds = buildOptions(59, secondStep);

  function commit(next: string | null) {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  // 尚未选值时的隐含基准：把 00:00:00 夹进 [min,max]。
  // 不这么做的话，min="09:30" 下基准小时恒为 0，分钟列会被整列判死——面板看着像坏了，
  // 用户还得先猜到「要先点小时」。夹紧后基准落在 09:30，分钟列立刻可用。
  const base: TimeParts = parsed ?? clampTime({ h: 0, m: 0, s: 0 }, withSeconds, minTime, maxTime);

  /** 改动某一列后重新提交；结果再夹一次，杜绝提交出范围外的值。 */
  function pick(patch: Partial<TimeParts>) {
    if (readOnly) return;
    const next = clampTime({ ...base, ...patch }, withSeconds, minTime, maxTime);
    commit(formatTime(next, withSeconds));
  }

  function pickNow() {
    if (readOnly) return;
    const d = new Date();
    const snapped = snapToStep(
      { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() },
      minuteStep,
      secondStep,
    );
    commit(formatTime(clampTime(snapped, withSeconds, minTime, maxTime), withSeconds));
    setOpen(false);
  }

  function clearValue(e: React.MouseEvent) {
    e.stopPropagation();
    commit(null);
  }

  const showClear = clearable && value != null && !disabled && !readOnly;
  const text = parsed ? formatTime(parsed, withSeconds) : "";

  return (
    <BasePopover.Root
      open={open}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
      }}
    >
      <div className={cn("relative inline-flex", className)}>
        <BasePopover.Trigger
          render={
            <button
              type="button"
              disabled={disabled}
              aria-label={ariaLabel}
              className={cn(triggerVariants({ size }), showClear && "pr-8")}
            >
              <Clock className={triggerIconVariants({ size })} aria-hidden />
              <span className={cn("truncate tabular-nums", !text && "text-muted")}>
                {text || resolvedPlaceholder}
              </span>
            </button>
          }
        />
        {showClear && (
          <button
            type="button"
            aria-label={locale.clear}
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
              "rounded-[var(--radius)] border border-hairline bg-surface text-foreground shadow-xl outline-none",
              "origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            )}
            style={overlayTransition}
          >
            <div className="flex divide-x divide-border">
              <TimeColumn
                label={locale.hour}
                values={hours}
                active={parsed?.h ?? null}
                isDisabled={(h) => isHourDisabled(h, minTime, maxTime)}
                onPick={(h) => pick({ h })}
                open={open}
              />
              <TimeColumn
                label={locale.minute}
                values={minutes}
                active={parsed?.m ?? null}
                isDisabled={(m) => isMinuteDisabled(base.h, m, minTime, maxTime)}
                onPick={(m) => pick({ m })}
                open={open}
              />
              {withSeconds && (
                <TimeColumn
                  label={locale.second}
                  values={seconds}
                  active={parsed?.s ?? null}
                  isDisabled={(s) => isSecondDisabled(base.h, base.m, s, minTime, maxTime)}
                  onPick={(s) => pick({ s })}
                  open={open}
                />
              )}
            </div>
            {showNow && (
              <div className="flex items-center justify-between border-t border-border px-2 py-1.5">
                <button
                  type="button"
                  onClick={pickNow}
                  disabled={readOnly}
                  className="rounded-md px-2 py-1 text-sm text-primary outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {locale.now}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-1 text-sm text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  {locale.confirm}
                </button>
              </div>
            )}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

export const TimePicker = memo(TimePickerImpl);
TimePicker.displayName = "TimePicker";
