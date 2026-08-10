"use client";
import { memo, useState } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cva } from "class-variance-authority";
import { Calendar as CalendarIcon, X } from "../_icons";
import { Calendar } from "../calendar";
import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import { dayjs } from "../lib/date";
import { motionDurationCss, motionEaseCss } from "../motion";
import { TimeColumn } from "../time-picker/time-column";
import {
  buildOptions,
  clampTime,
  formatTime as formatTimeParts,
  isHourDisabled,
  isMinuteDisabled,
  isSecondDisabled,
  parseTime,
  snapToStep,
  type TimeParts,
} from "../time-picker/time-picker-core";
import {
  boundDate,
  clampDateTime,
  effectiveTimeBounds,
  joinDateTime,
  splitDateTime,
} from "./date-time-picker-core";
import type { DateTimePickerProps } from "./date-time-picker.types";

// 零依赖日期时间选择器：左边一整块 <Calendar>，右边三列时间（与 TimePicker 同一个 TimeColumn）。
// 两半各管各的，合成与边界换算全在 date-time-picker-core 里 —— 尤其是「时间边界只在
// 压着 min/max 那一天才生效」这条，它是这个组件里唯一容易写错的地方。

// 与 popover.tsx 同款：transition 简写避免与 Base UI 内联长写混用触发 React shorthand 警告。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

// 触发器刻度与 Input 外壳逐字一致（32/40/48）：日期时间选择器几乎总是和 Input/Select 并排落在
// 同一行表单里，任何自创档位都会当场露出高度差。min-w 是本组件的内容宽度，不随档位变。
const triggerVariants = cva(
  [
    "inline-flex min-w-[13rem] items-center gap-2 rounded-[var(--radius)] border border-border bg-bg text-foreground outline-none transition-colors",
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

const triggerIconVariants = cva("shrink-0 text-muted-foreground", {
  variants: { size: { sm: "size-3.5", md: "size-4", lg: "size-5" } },
  defaultVariants: { size: "md" },
});

function DateTimePickerImpl({
  value: valueProp,
  defaultValue,
  onValueChange,
  withSeconds = false,
  size = "md",
  minuteStep = 1,
  secondStep = 1,
  minDateTime,
  maxDateTime,
  disabledDate,
  placeholder: placeholderProp,
  displayFormat,
  clearable = true,
  showNow = true,
  disabled,
  readOnly,
  "aria-label": ariaLabel,
  className,
}: DateTimePickerProps) {
  const labels = useComponentLocale().dateTimePicker ?? {
    placeholder: "选择日期时间",
    clear: "清除",
    hour: "时",
    minute: "分",
    second: "秒",
    now: "此刻",
    confirm: "确定",
  };
  const placeholder = placeholderProp ?? labels.placeholder;
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState<string | null>(defaultValue ?? null);
  const value = isControlled ? valueProp ?? null : internal;
  const { date, time } = splitDateTime(value);

  const [open, setOpen] = useState(false);

  // 时间列的可选范围随选中日变化：只有压在边界那天才受限，区间内部的日子 24 小时全开。
  const { minTime, maxTime } = effectiveTimeBounds(date, minDateTime, maxDateTime);
  const parsedTime = parseTime(time);
  // 尚未选时间时的隐含基准，同 TimePicker：把 00:00:00 夹进 [min,max]，
  // 否则 minTime="09:30" 下基准小时恒为 0，分钟列会被整列判死，面板看着像坏了。
  const base: TimeParts =
    parsedTime ?? clampTime({ h: 0, m: 0, s: 0 }, withSeconds, minTime, maxTime);

  function commit(next: string | null) {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  /** 日期或时间任一侧改动后重新合成；结果整体再夹一次，杜绝提交出范围外的值。 */
  function commitParts(nextDate: string | null, nextTime: string | null) {
    const raw = joinDateTime(nextDate, nextTime, withSeconds);
    if (raw == null) {
      commit(null);
      return;
    }
    commit(clampDateTime(raw, withSeconds, minDateTime, maxDateTime));
  }

  function pickDate(nextDate: string) {
    if (readOnly) return;
    // 换天会换掉时间边界，所以时间要按新那天的边界重夹一次
    const bounds = effectiveTimeBounds(nextDate, minDateTime, maxDateTime);
    const t = parsedTime ?? { h: 0, m: 0, s: 0 };
    commitParts(
      nextDate,
      formatTimeParts(clampTime(t, withSeconds, bounds.minTime, bounds.maxTime), withSeconds),
    );
  }

  function pickTime(patch: Partial<TimeParts>) {
    if (readOnly) return;
    const next = clampTime({ ...base, ...patch }, withSeconds, minTime, maxTime);
    // 还没选日期就先点了时间：默认落到今天，否则这一下点了等于没点
    commitParts(date ?? dayjs().format("YYYY-MM-DD"), formatTimeParts(next, withSeconds));
  }

  function pickNow() {
    if (readOnly) return;
    const d = new Date();
    const today = dayjs(d).format("YYYY-MM-DD");
    const bounds = effectiveTimeBounds(today, minDateTime, maxDateTime);
    const snapped = snapToStep(
      { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() },
      minuteStep,
      secondStep,
    );
    commitParts(
      today,
      formatTimeParts(clampTime(snapped, withSeconds, bounds.minTime, bounds.maxTime), withSeconds),
    );
    setOpen(false);
  }

  function clearValue(e: React.MouseEvent) {
    e.stopPropagation();
    commit(null);
  }

  const showClear = clearable && value != null && !disabled && !readOnly;
  const text = value ? (displayFormat ? dayjs(value).format(displayFormat) : value) : "";

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
              <CalendarIcon className={triggerIconVariants({ size })} aria-hidden />
              <span className={cn("truncate tabular-nums", !text && "text-muted-foreground")}>
                {text || placeholder}
              </span>
            </button>
          }
        />
        {showClear && (
          <button
            type="button"
            aria-label={labels.clear}
            onClick={clearValue}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
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
              <div className="p-3">
                <Calendar
                  value={date}
                  onValueChange={pickDate}
                  minDate={boundDate(minDateTime)}
                  maxDate={boundDate(maxDateTime)}
                  disabledDate={disabledDate}
                  readOnly={readOnly}
                  showToday={false}
                />
              </div>
              <div className="flex divide-x divide-border">
                <TimeColumn
                  label={labels.hour}
                  values={buildOptions(23, 1)}
                  active={parsedTime?.h ?? null}
                  isDisabled={(h) => isHourDisabled(h, minTime, maxTime)}
                  onPick={(h) => pickTime({ h })}
                  open={open}
                />
                <TimeColumn
                  label={labels.minute}
                  values={buildOptions(59, minuteStep)}
                  active={parsedTime?.m ?? null}
                  isDisabled={(m) => isMinuteDisabled(base.h, m, minTime, maxTime)}
                  onPick={(m) => pickTime({ m })}
                  open={open}
                />
                {withSeconds && (
                  <TimeColumn
                    label={labels.second}
                    values={buildOptions(59, secondStep)}
                    active={parsedTime?.s ?? null}
                    isDisabled={(s) => isSecondDisabled(base.h, base.m, s, minTime, maxTime)}
                    onPick={(s) => pickTime({ s })}
                    open={open}
                  />
                )}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border px-2 py-1.5">
              {showNow ? (
                <button
                  type="button"
                  onClick={pickNow}
                  disabled={readOnly}
                  className="rounded-md px-2 py-1 text-sm text-primary outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {labels.now}
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                {labels.confirm}
              </button>
            </div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

export const DateTimePicker = memo(DateTimePickerImpl);
DateTimePicker.displayName = "DateTimePicker";
