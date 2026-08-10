"use client";
import { useState } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cva } from "class-variance-authority";
// 内部一律用 YYYY-MM-DD 文本作日期标识（toISO/normISO 出自 lib/date）：
// 定宽 → 字典序即时间序，区间判定可直接字符串比较，避开时区/UTC 偏移日界坑。
import {
  DATE_FORMAT,
  dayjs,
  type Dayjs,
  monthMatrix,
  normISODate as normISO,
  toISODate as toISO,
} from "../lib/date";
import { Calendar, ChevronLeft, ChevronRight, X } from "../_icons";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type {
  DateRangePickerProps,
  DateRangePreset,
  DateRangeValue,
} from "./date-range-picker.types";

// 与 popover.tsx 同款：transition 简写避免与 Base UI 内联长写混用触发 React shorthand 警告。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

// 触发器刻度与 Input 外壳逐字一致（32/40/48）：区间选择器几乎总是和 Input/Select 并排落在
// 同一行表单里，任何自创档位都会当场露出高度差。min-w 是本组件的内容宽度，不随档位变。
// 注意：面板里日期格的 h-9 / size-9 是网格几何（与 size-9 的日按钮成对），与触发器无关，不跟档。
const triggerVariants = cva(
  [
    "inline-flex min-w-[16rem] items-center gap-2 rounded-[var(--radius)] border border-border bg-bg text-foreground outline-none transition-colors",
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

export function DateRangePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  size = "md",
  minDate,
  maxDate,
  disabledDate,
  presets,
  placeholder,
  displayFormat = DATE_FORMAT,
  disabled,
  readOnly,
  className,
}: DateRangePickerProps) {
  const componentLocale = useComponentLocale();
  const locale = componentLocale.dateRangePicker ?? {
    today: "今天",
    lastDays: (days) => `最近 ${days} 天`,
    thisMonth: "本月",
    startDate: "开始日期",
    endDate: "结束日期",
    month: (year, month) => `${year} 年 ${month} 月`,
    clear: "清除",
    previousMonth: "上个月",
    nextMonth: "下个月",
  };
  const calendarLocale = componentLocale.calendar ?? {
    label: "日历",
    previousPage: "上一页",
    nextPage: "下一页",
    weekdays: ["日", "一", "二", "三", "四", "五", "六"],
    months: [
      "1 月",
      "2 月",
      "3 月",
      "4 月",
      "5 月",
      "6 月",
      "7 月",
      "8 月",
      "9 月",
      "10 月",
      "11 月",
      "12 月",
    ],
    monthTitle: (year, month) => `${year} 年 ${month} 月`,
    yearTitle: (year) => `${year} 年`,
    today: "今天",
    thisMonth: "本月",
    thisYear: "今年",
  };
  const resolvedPlaceholder = placeholder ?? [locale.startDate, locale.endDate];
  const defaultPresets: DateRangePreset[] = [
    {
      label: locale.today,
      getValue: () => {
        const t = toISO(dayjs());
        return [t, t];
      },
    },
    {
      label: locale.lastDays(7),
      getValue: () => [toISO(dayjs().subtract(6, "day")), toISO(dayjs())],
    },
    {
      label: locale.lastDays(30),
      getValue: () => [toISO(dayjs().subtract(29, "day")), toISO(dayjs())],
    },
    {
      label: locale.thisMonth,
      getValue: () => [toISO(dayjs().startOf("month")), toISO(dayjs().endOf("month"))],
    },
  ];
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState<DateRangeValue | null>(defaultValue ?? null);
  const value = isControlled ? valueProp ?? null : internal;

  const [open, setOpen] = useState(false);
  // anchor = 选区起点（一次选择进行中），hover = 预览终点；二者都为 null 时显示已提交 value。
  const [anchor, setAnchor] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState<Dayjs>(() =>
    ((isControlled ? valueProp : defaultValue)?.[0]
      ? dayjs((isControlled ? valueProp : defaultValue)![0])
      : dayjs()
    ).startOf("month"),
  );

  const min = normISO(minDate);
  const max = normISO(maxDate);
  const presetList: DateRangePreset[] | null =
    presets === false ? null : presets === true || presets === undefined ? defaultPresets : presets;
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
        <div className="mb-2 text-center text-sm font-medium text-foreground">
          {locale.month(month.year(), month.month() + 1)}
        </div>
        <div className="grid grid-cols-7">
          {calendarLocale.weekdays.map((w) => (
            <div key={w} className="flex h-8 items-center justify-center text-xs text-muted-foreground">
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
                    dis && "cursor-not-allowed text-muted-foreground/40 hover:bg-transparent",
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
              className={cn(triggerVariants({ size }), showClear && "pr-8")}
            >
              <Calendar className={triggerIconVariants({ size })} aria-hidden />
              <span className={cn(!startText && "text-muted-foreground")}>
                {startText || resolvedPlaceholder[0]}
              </span>
              <span className="text-muted-foreground">~</span>
              <span className={cn(!endText && "text-muted-foreground")}>
                {endText || resolvedPlaceholder[1]}
              </span>
            </button>
          }
        />
        {showClear && (
          <button
            type="button"
            aria-label={locale.clear}
            onClick={clearValue}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground outline-none hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
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
                        active
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-foreground hover:bg-surface-hover",
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
                  aria-label={locale.previousMonth}
                  onClick={() => setViewMonth(viewMonth.subtract(1, "month"))}
                  className="rounded-md p-1 text-muted-foreground outline-none hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={locale.nextMonth}
                  onClick={() => setViewMonth(viewMonth.add(1, "month"))}
                  className="rounded-md p-1 text-muted-foreground outline-none hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
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
