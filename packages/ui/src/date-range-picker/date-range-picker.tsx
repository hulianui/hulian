"use client";
import { useState } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
// 内部一律用 YYYY-MM-DD 文本作日期标识（toISO/normISO 出自 lib/date）：
// 定宽 → 字典序即时间序，区间判定可直接字符串比较，避开时区/UTC 偏移日界坑。
import {
  DATE_FORMAT,
  dayjs,
  type Dayjs,
  monthMatrix,
  normISODate as normISO,
  toISODate as toISO,
  WEEKDAY_LABELS as WEEKDAYS,
} from "../lib/date";
import { Calendar, ChevronLeft, ChevronRight, X } from "../_icons";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { DateRangePickerProps, DateRangePreset, DateRangeValue } from "./date-range-picker.types";

// 与 popover.tsx 同款：transition 简写避免与 Base UI 内联长写混用触发 React shorthand 警告。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

const DEFAULT_PRESETS: DateRangePreset[] = [
  { label: "今天", getValue: () => { const t = toISO(dayjs()); return [t, t]; } },
  { label: "最近 7 天", getValue: () => [toISO(dayjs().subtract(6, "day")), toISO(dayjs())] },
  { label: "最近 30 天", getValue: () => [toISO(dayjs().subtract(29, "day")), toISO(dayjs())] },
  { label: "本月", getValue: () => [toISO(dayjs().startOf("month")), toISO(dayjs().endOf("month"))] },
];

export function DateRangePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  disabledDate,
  presets,
  placeholder = ["开始日期", "结束日期"],
  displayFormat = DATE_FORMAT,
  disabled,
  readOnly,
  className,
}: DateRangePickerProps) {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState<DateRangeValue | null>(defaultValue ?? null);
  const value = isControlled ? valueProp ?? null : internal;

  const [open, setOpen] = useState(false);
  // anchor = 选区起点（一次选择进行中），hover = 预览终点；二者都为 null 时显示已提交 value。
  const [anchor, setAnchor] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState<Dayjs>(() =>
    ((isControlled ? valueProp : defaultValue)?.[0] ? dayjs((isControlled ? valueProp : defaultValue)![0]) : dayjs()).startOf("month"),
  );

  const min = normISO(minDate);
  const max = normISO(maxDate);
  const presetList: DateRangePreset[] | null =
    presets === false ? null : presets === true || presets === undefined ? DEFAULT_PRESETS : presets;
  const today = toISO(dayjs());

  function isDisabledDay(iso: string): boolean {
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return disabledDate?.(iso) ?? false;
  }

  function commit(next: DateRangeValue | null) {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  function handleOpenChange(next: boolean) {
    if (disabled) return;
    setOpen(next);
    if (next) {
      // 打开时把视图对齐到当前起点所在月
      if (value) setViewMonth(dayjs(value[0]).startOf("month"));
    } else {
      // 关闭时丢弃未完成的半选
      setAnchor(null);
      setHoverDate(null);
    }
  }

  function selectDay(iso: string) {
    if (readOnly || isDisabledDay(iso)) return;
    if (anchor == null) {
      setAnchor(iso);
      setHoverDate(iso);
      return;
    }
    const next: DateRangeValue = anchor <= iso ? [anchor, iso] : [iso, anchor];
    commit(next);
    setAnchor(null);
    setHoverDate(null);
    setOpen(false);
  }

  function applyPreset(p: DateRangePreset) {
    if (readOnly) return;
    const r = p.getValue();
    commit(r);
    setAnchor(null);
    setHoverDate(null);
    setViewMonth(dayjs(r[0]).startOf("month"));
    setOpen(false);
  }

  function clearValue(e: React.MouseEvent) {
    e.stopPropagation();
    commit(null);
    setAnchor(null);
    setHoverDate(null);
  }

  // 当前要高亮的区间：选择进行中 → [min(anchor,hover), max]；否则已提交 value。
  const previewRange: DateRangeValue | null = (() => {
    if (anchor != null) {
      const end = hoverDate ?? anchor;
      return anchor <= end ? [anchor, end] : [end, anchor];
    }
    return value;
  })();

  const startText = value ? dayjs(value[0]).format(displayFormat) : "";
  const endText = value ? dayjs(value[1]).format(displayFormat) : "";
  const showClear = value != null && !disabled && !readOnly;

  function renderMonth(month: Dayjs) {
    return (
      <div>
        <div className="mb-2 text-center text-sm font-medium text-foreground">{month.format("YYYY 年 M 月")}</div>
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((w) => (
            <div key={w} className="flex h-8 items-center justify-center text-xs text-muted">
              {w}
            </div>
          ))}
          {monthMatrix(month).map((d) => {
            const iso = toISO(d);
            const inMonth = d.month() === month.month();
            const dis = isDisabledDay(iso);
            const r = previewRange;
            const isStart = r != null && iso === r[0];
            const isEnd = r != null && iso === r[1];
            const isEndpoint = isStart || isEnd;
            const isSingle = r != null && r[0] === r[1] && isEndpoint;
            const inRange = r != null && iso > r[0] && iso < r[1];
            const isToday = iso === today;
            return (
              <div
                key={iso}
                className={cn(
                  "flex h-9 items-center justify-center",
                  // 中间态连续底带；端点格只在朝内侧保留底带（用 rounded 收口），单日不带底带。
                  inRange && "bg-primary/10",
                  isStart && !isSingle && "rounded-l-full bg-primary/10",
                  isEnd && !isSingle && "rounded-r-full bg-primary/10",
                )}
              >
                <button
                  type="button"
                  disabled={dis || !inMonth}
                  aria-label={iso}
                  aria-pressed={isEndpoint}
                  data-selected={isEndpoint ? "" : undefined}
                  onClick={() => selectDay(iso)}
                  onMouseEnter={() => {
                    if (anchor != null && inMonth && !dis) setHoverDate(iso);
                  }}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full text-sm transition-colors",
                    !inMonth && "invisible",
                    isEndpoint
                      ? "bg-primary font-medium text-primary-foreground"
                      : "text-foreground hover:bg-surface-hover",
                    isToday && !isEndpoint && "font-semibold text-primary",
                    dis && "cursor-not-allowed text-muted/40 hover:bg-transparent",
                  )}
                >
                  {d.date()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <BasePopover.Root open={open} onOpenChange={handleOpenChange}>
      <div className={cn("relative inline-flex", className)}>
        <BasePopover.Trigger
          render={
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "inline-flex h-9 min-w-[16rem] items-center gap-2 rounded-[var(--radius)] border border-border bg-bg px-3 text-sm text-foreground outline-none transition-colors",
                "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30",
                "disabled:cursor-not-allowed disabled:opacity-50",
                showClear && "pr-8",
              )}
            >
              <Calendar className="size-4 shrink-0 text-muted" aria-hidden />
              <span className={cn(!startText && "text-muted")}>{startText || placeholder[0]}</span>
              <span className="text-muted">~</span>
              <span className={cn(!endText && "text-muted")}>{endText || placeholder[1]}</span>
            </button>
          }
        />
        {showClear && (
          <button
            type="button"
            aria-label="清除"
            onClick={clearValue}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted outline-none hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      <BasePopover.Portal>
        <BasePopover.Positioner side="bottom" align="start" sideOffset={8} className="z-50">
          <BasePopover.Popup
            className={cn(
              "flex rounded-[var(--radius)] border border-hairline bg-surface text-foreground shadow-xl outline-none",
              "origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            )}
            style={overlayTransition}
          >
            {presetList && (
              <div className="flex w-28 flex-col gap-1 border-r border-border p-2">
                {presetList.map((p) => {
                  const r = p.getValue();
                  const active = value != null && value[0] === r[0] && value[1] === r[1];
                  return (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => applyPreset(p)}
                      disabled={readOnly}
                      className={cn(
                        "rounded-md px-2 py-1.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                        active ? "bg-primary/10 font-medium text-primary" : "text-foreground hover:bg-surface-hover",
                      )}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="p-3">
              <div className="relative mb-1 flex items-center justify-between px-1">
                <button
                  type="button"
                  aria-label="上个月"
                  onClick={() => setViewMonth(viewMonth.subtract(1, "month"))}
                  className="rounded-md p-1 text-muted outline-none hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="下个月"
                  onClick={() => setViewMonth(viewMonth.add(1, "month"))}
                  className="rounded-md p-1 text-muted outline-none hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
              <div className="flex gap-4">
                {renderMonth(viewMonth)}
                {renderMonth(viewMonth.add(1, "month"))}
              </div>
            </div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
