"use client";
import { useState } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { cva } from "class-variance-authority";
// 内部一律用 YYYY-MM-DD 文本作日期标识（toISO/normISO 出自 lib/date）：
// 定宽 → 字典序即时间序，区间判定可直接字符串比较，避开时区/UTC 偏移日界坑。
import {
  dayjs,
  type Dayjs,
  monthMatrix,
  normISODate as normISO,
  toISODate as toISO,
} from "../lib/date";
// 禁用判定与格式化直接吃 Calendar / DatePicker 那份纯逻辑：三件的边界语义必须逐字相同，
// 各写一份迟早漂开（尤其「月粒度下 maxDate 落在月中，那个月还能不能选」这种问题）。
import {
  PICKER_FORMAT,
  formatValue,
  isDisabledDay,
  isDisabledMonth,
  isDisabledYear,
  parseValue,
} from "../calendar/calendar-core";
import type { CalendarPicker } from "../calendar/calendar.types";
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

// ── 粒度几何 ────────────────────────────────────────────────────────────────
// 一个「页」= 一个面板。三种粒度只有三处不同：页的跨度、页里有哪些格、格显示什么。
// 区间判定本身完全共用——三种值都是定宽文本（YYYY-MM-DD / YYYY-MM / YYYY），
// 字典序即时间序，端点与区间内都能直接比字符串。
//
// 年粒度一页 12 年（不是 Calendar 那边的十年段）：那边是下钻用的辅助视图，首尾两格
// 特意越界一年当「上/下段补位」；这里两页并排，越界格会让同一个年份在左右两页各出现一次，
// 点哪个都对但读起来像重复项。12 年整段既排满 3×4，也保证两页不重叠。
const YEARS_PER_PAGE = 12;

/** 把任意时刻对齐到它所在那一页的页首。 */
function pageStart(d: Dayjs, picker: CalendarPicker): Dayjs {
  if (picker === "date") return d.startOf("month");
  if (picker === "month") return d.startOf("year");
  return d.startOf("year").year(Math.floor(d.year() / YEARS_PER_PAGE) * YEARS_PER_PAGE);
}

/** 翻页：日→月、月→年、年→12 年。 */
function pageStep(d: Dayjs, picker: CalendarPicker, dir: number): Dayjs {
  if (picker === "date") return d.add(dir, "month");
  if (picker === "month") return d.add(dir, "year");
  return d.add(dir * YEARS_PER_PAGE, "year");
}

export function DateRangePicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  picker = "date",
  size = "md",
  minDate,
  maxDate,
  disabledDate,
  presets,
  placeholder,
  displayFormat,
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
  // 占位与预设的粒度分支：内置文案一律走 locale，别在这里硬编码中文——英文站会当场露馅。
  // 新词条在 locale 接口里是**可选**的（加必填会让自带 locale 的消费方 TS 报错），
  // 故此处保留一份与 zhCN 同文的兜底。
  const startLabel =
    picker === "month"
      ? locale.startMonth ?? "开始月份"
      : picker === "year"
      ? locale.startYear ?? "开始年份"
      : locale.startDate;
  const endLabel =
    picker === "month"
      ? locale.endMonth ?? "结束月份"
      : picker === "year"
      ? locale.endYear ?? "结束年份"
      : locale.endDate;
  const resolvedPlaceholder = placeholder ?? [startLabel, endLabel];
  const fmt = (d: Dayjs) => formatValue(d, picker);
  const lastMonths = (n: number) => locale.lastMonths?.(n) ?? `最近 ${n} 个月`;
  const lastYears = (n: number) => locale.lastYears?.(n) ?? `最近 ${n} 年`;
  const thisYearLabel = calendarLocale.thisYear;
  // 「最近 N 个月/年」含当前这一段（近 3 个月 = 本月与前两个月），与「最近 7 天」含今天同口径。
  const datePresets: DateRangePreset[] = [
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
  const monthPresets: DateRangePreset[] = [
    {
      label: locale.thisMonth,
      getValue: () => [fmt(dayjs()), fmt(dayjs())],
    },
    { label: lastMonths(3), getValue: () => [fmt(dayjs().subtract(2, "month")), fmt(dayjs())] },
    { label: lastMonths(6), getValue: () => [fmt(dayjs().subtract(5, "month")), fmt(dayjs())] },
    {
      label: thisYearLabel,
      getValue: () => [fmt(dayjs().startOf("year")), fmt(dayjs().endOf("year"))],
    },
  ];
  const yearPresets: DateRangePreset[] = [
    { label: thisYearLabel, getValue: () => [fmt(dayjs()), fmt(dayjs())] },
    { label: lastYears(3), getValue: () => [fmt(dayjs().subtract(2, "year")), fmt(dayjs())] },
    { label: lastYears(5), getValue: () => [fmt(dayjs().subtract(4, "year")), fmt(dayjs())] },
  ];
  const defaultPresets: DateRangePreset[] =
    picker === "month" ? monthPresets : picker === "year" ? yearPresets : datePresets;
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState<DateRangeValue | null>(defaultValue ?? null);
  const value = isControlled ? valueProp ?? null : internal;

  const [open, setOpen] = useState(false);
  // anchor = 选区起点（一次选择进行中），hover = 预览终点；二者都为 null 时显示已提交 value。
  const [anchor, setAnchor] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  // 视图停在哪一页。初值对齐到当前起点所在的页（日→该月、月→该年、年→该 12 年段）。
  const [viewPage, setViewPage] = useState<Dayjs>(() => {
    const initial = (isControlled ? valueProp : defaultValue)?.[0];
    return pageStart(parseValue(initial, picker) ?? dayjs(), picker);
  });

  const min = normISO(minDate);
  const max = normISO(maxDate);
  const rules = { min, max, disabledDate };
  const presetList: DateRangePreset[] | null =
    presets === false ? null : presets === true || presets === undefined ? defaultPresets : presets;
  const today = toISO(dayjs());
  const todayValue = formatValue(dayjs(), picker);

  function commit(next: DateRangeValue | null) {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  function handleOpenChange(next: boolean) {
    if (disabled) return;
    setOpen(next);
    if (next) {
      // 打开时把视图对齐到当前起点所在的页
      if (value) setViewPage(pageStart(parseValue(value[0], picker) ?? dayjs(), picker));
    } else {
      // 关闭时丢弃未完成的半选
      setAnchor(null);
      setHoverDate(null);
    }
  }

  /** 选中一格。入参是该粒度的对外值（定宽文本），三种粒度共用同一套端点逻辑。 */
  function selectCell(cellValue: string, cellDisabled: boolean) {
    if (readOnly || cellDisabled) return;
    if (anchor == null) {
      setAnchor(cellValue);
      setHoverDate(cellValue);
      return;
    }
    const next: DateRangeValue =
      anchor <= cellValue ? [anchor, cellValue] : [cellValue, anchor];
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
    setViewPage(pageStart(parseValue(r[0], picker) ?? dayjs(), picker));
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

  const startText = value
    ? (parseValue(value[0], picker) ?? dayjs(value[0])).format(displayFormat ?? PICKER_FORMAT[picker])
    : "";
  const endText = value
    ? (parseValue(value[1], picker) ?? dayjs(value[1])).format(displayFormat ?? PICKER_FORMAT[picker])
    : "";
  const showClear = value != null && !disabled && !readOnly;

  /**
   * 一格的区间状态。三种粒度共用：值都是定宽文本，字典序即时间序。
   * 端点朝内侧留底带（rounded 收口），单格选中不带底带——不然一格宽的「区间」看着像被截断了。
   */
  function cellState(cellValue: string) {
    const r = previewRange;
    const isStart = r != null && cellValue === r[0];
    const isEnd = r != null && cellValue === r[1];
    const isEndpoint = isStart || isEnd;
    return {
      isEndpoint,
      isSingle: r != null && r[0] === r[1] && isEndpoint,
      isStart,
      isEnd,
      inRange: r != null && cellValue > r[0] && cellValue < r[1],
    };
  }

  // 收口圆角按格形给：日格是圆的（rounded-full），月/年格是圆角矩形（rounded-md）。
  // 两条都写成完整字面量——拼接出来的类名 Tailwind 扫不到，样式会静默不生成。
  function bandClass(cellValue: string, shape: "full" | "md") {
    const { isStart, isEnd, isSingle, inRange } = cellState(cellValue);
    const left = shape === "full" ? "rounded-l-full bg-primary/10" : "rounded-l-md bg-primary/10";
    const right = shape === "full" ? "rounded-r-full bg-primary/10" : "rounded-r-md bg-primary/10";
    return cn(inRange && "bg-primary/10", isStart && !isSingle && left, isEnd && !isSingle && right);
  }

  function renderDayPage(month: Dayjs) {
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
            const dis = isDisabledDay(iso, rules);
            const { isEndpoint } = cellState(iso);
            const isToday = iso === today;
            return (
              <div
                key={iso}
                className={cn("flex h-9 items-center justify-center", bandClass(iso, "full"))}
              >
                <button
                  type="button"
                  disabled={dis || !inMonth}
                  aria-label={iso}
                  aria-pressed={isEndpoint}
                  data-selected={isEndpoint ? "" : undefined}
                  onClick={() => selectCell(iso, dis)}
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

  /** 月 / 年页共用的 3×4 网格：格子形状一样，只有取值与标签不同。 */
  function renderGridPage(
    title: string,
    cells: { value: string; label: string; disabled: boolean; current: boolean }[],
  ) {
    return (
      <div className="w-[15.75rem]">
        <div className="mb-2 text-center text-sm font-medium text-foreground">{title}</div>
        <div className="grid grid-cols-3 gap-y-1">
          {cells.map((c) => {
            const { isEndpoint } = cellState(c.value);
            return (
              <div
                key={c.value}
                className={cn("flex h-10 items-center", bandClass(c.value, "md"))}
              >
                <button
                  type="button"
                  disabled={c.disabled}
                  aria-label={c.value}
                  aria-pressed={isEndpoint}
                  data-selected={isEndpoint ? "" : undefined}
                  onClick={() => selectCell(c.value, c.disabled)}
                  onMouseEnter={() => {
                    if (anchor != null && !c.disabled) setHoverDate(c.value);
                  }}
                  className={cn(
                    "mx-0.5 flex h-9 flex-1 items-center justify-center rounded-md text-sm transition-colors",
                    isEndpoint
                      ? "bg-primary font-medium text-primary-foreground"
                      : "text-foreground hover:bg-surface-hover",
                    c.current && !isEndpoint && "font-semibold text-primary",
                    c.disabled && "cursor-not-allowed text-muted-foreground/40 hover:bg-transparent",
                  )}
                >
                  {c.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderMonthPage(year: Dayjs) {
    const cells = calendarLocale.months.map((label, i) => {
      const m = year.month(i);
      return {
        value: formatValue(m, "month"),
        label,
        disabled: isDisabledMonth(m, "month", rules),
        current: formatValue(m, "month") === todayValue,
      };
    });
    return renderGridPage(calendarLocale.yearTitle(year.year()), cells);
  }

  function renderYearPage(page: Dayjs) {
    const first = page.year();
    const cells = Array.from({ length: YEARS_PER_PAGE }, (_, i) => {
      const y = first + i;
      return {
        value: String(y),
        label: String(y),
        disabled: isDisabledYear(y, "year", rules),
        current: String(y) === todayValue,
      };
    });
    return renderGridPage(`${first} - ${first + YEARS_PER_PAGE - 1}`, cells);
  }

  function renderPage(page: Dayjs) {
    if (picker === "month") return renderMonthPage(page);
    if (picker === "year") return renderYearPage(page);
    return renderDayPage(page);
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
                {/* 翻页按钮的名字随粒度：日档翻的是月，月/年档翻的是「一页」，
                    照抄「上个月」会读错（月档一页是一年、年档一页是 12 年）。 */}
                <button
                  type="button"
                  aria-label={picker === "date" ? locale.previousMonth : calendarLocale.previousPage}
                  onClick={() => setViewPage(pageStep(viewPage, picker, -1))}
                  className="rounded-md p-1 text-muted-foreground outline-none hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label={picker === "date" ? locale.nextMonth : calendarLocale.nextPage}
                  onClick={() => setViewPage(pageStep(viewPage, picker, 1))}
                  className="rounded-md p-1 text-muted-foreground outline-none hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
              <div className="flex gap-4">
                {renderPage(viewPage)}
                {renderPage(pageStep(viewPage, picker, 1))}
              </div>
            </div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
