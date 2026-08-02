"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "../_icons";
import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import {
  dayjs,
  type Dayjs,
  monthMatrix,
  normISODate as normISO,
  toISODate as toISO,
  yearMatrix,
} from "../lib/date";
import {
  formatValue,
  isDisabledDay,
  isDisabledMonth,
  isDisabledYear,
  parseValue,
} from "./calendar-core";
import type { CalendarPicker, CalendarProps } from "./calendar.types";

// 零依赖常驻日历面板。三种粒度共用一套面板：内部 view 在 date → month → year 之间
// 下钻/上卷，picker 决定「点到哪一层就提交」。
//
// 这份面板同时是 DatePicker / DateTimePicker 的弹层内容 —— 它们只是在外面套了触发器与
// Popover。所以任何面板行为（禁用判定、下钻、今天）只在这里实现一次。

const navBtn =
  "rounded-md p-1 text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40";

const cellBase = "flex items-center justify-center rounded-md text-sm transition-colors";

export function Calendar({
  value: valueProp,
  defaultValue,
  onValueChange,
  picker = "date",
  defaultMonth,
  minDate,
  maxDate,
  disabledDate,
  showToday = true,
  disabled,
  readOnly,
  "aria-label": ariaLabelProp,
  className,
}: CalendarProps) {
  const locale = useComponentLocale().calendar ?? {
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
    monthTitle: (year: number, month: number) => `${year} 年 ${month} 月`,
    yearTitle: (year: number) => `${year} 年`,
    today: "今天",
    thisMonth: "本月",
    thisYear: "今年",
  };
  const ariaLabel = ariaLabelProp ?? locale.label;
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState<string | null>(defaultValue ?? null);
  const value = isControlled ? valueProp ?? null : internal;
  const selected = parseValue(value, picker);

  // 面板当前展示的层级。picker 决定它的起点与「点了就提交」的那一层。
  const [view, setView] = useState<CalendarPicker>(picker);
  const [cursor, setCursor] = useState<Dayjs>(() => {
    const from = defaultMonth ? dayjs(defaultMonth) : null;
    if (from?.isValid()) return from;
    return parseValue(valueProp ?? defaultValue, picker) ?? dayjs();
  });

  const rules = { min: normISO(minDate), max: normISO(maxDate), disabledDate };
  const today = dayjs();
  const todayISO = toISO(today);
  // disabled 与 readOnly 都不许选，区别只在 disabled 连翻页也停掉。
  const locked = disabled || readOnly;

  function commit(next: string) {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  function pickDay(d: Dayjs) {
    if (locked || isDisabledDay(toISO(d), rules)) return;
    commit(formatValue(d, picker));
  }

  function pickMonth(m: Dayjs) {
    if (locked || isDisabledMonth(m, picker, rules)) return;
    setCursor(m);
    // month 粒度到此为止；date 粒度只是下钻一层
    if (picker === "month") {
      commit(formatValue(m, picker));
      return;
    }
    setView("date");
  }

  function pickYear(y: number) {
    if (locked || isDisabledYear(y, picker, rules)) return;
    const next = cursor.year(y);
    setCursor(next);
    if (picker === "year") {
      commit(formatValue(next, picker));
      return;
    }
    setView("month");
  }

  function goToday() {
    if (locked) return;
    if (picker === "date" && isDisabledDay(todayISO, rules)) return;
    setCursor(today);
    setView(picker);
    commit(formatValue(today, picker));
  }

  // 上/下翻：date 层翻月，month 层翻年，year 层翻一个十年段。
  const step = (dir: 1 | -1) => {
    if (view === "date") setCursor(cursor.add(dir, "month"));
    else if (view === "month") setCursor(cursor.add(dir, "year"));
    else setCursor(cursor.add(dir * 10, "year"));
  };

  // years 是 12 格：[邻段末年, 本十年段 10 年, 邻段首年]，首尾两格弱化渲染。
  const years = yearMatrix(cursor.year());
  const decade: [number, number] = [years[1], years[10]];
  const headerTitle =
    view === "date"
      ? locale.monthTitle(cursor.year(), cursor.month() + 1)
      : view === "month"
      ? locale.yearTitle(cursor.year())
      : `${decade[0]} - ${decade[1]}`;

  // 标题可点：date → month → year 逐层上卷。year 层已是顶，不再可点。
  const headerUp = view === "date" ? "month" : view === "month" ? "year" : null;

  return (
    <div
      aria-label={ariaLabel}
      data-disabled={disabled ? "" : undefined}
      className={cn(
        "inline-block text-foreground",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2 px-1">
        <button
          type="button"
          aria-label={locale.previousPage}
          disabled={disabled}
          onClick={() => step(-1)}
          className={navBtn}
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          disabled={headerUp == null || disabled}
          onClick={() => headerUp && setView(headerUp)}
          className={cn(
            "rounded-md px-2 py-1 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30",
            headerUp ? "hover:bg-surface-hover" : "cursor-default",
          )}
        >
          {headerTitle}
        </button>
        <button
          type="button"
          aria-label={locale.nextPage}
          disabled={disabled}
          onClick={() => step(1)}
          className={navBtn}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {view === "date" && (
        <div className="grid w-[15.75rem] grid-cols-7">
          {locale.weekdays.map((w) => (
            <div key={w} className="flex h-8 items-center justify-center text-xs text-muted">
              {w}
            </div>
          ))}
          {monthMatrix(cursor).map((d) => {
            const iso = toISO(d);
            const inMonth = d.month() === cursor.month();
            const dis = isDisabledDay(iso, rules);
            const isSelected = selected != null && picker === "date" && iso === toISO(selected);
            const isToday = iso === todayISO;
            return (
              <div key={iso} className="flex h-9 items-center justify-center">
                <button
                  type="button"
                  disabled={dis || !inMonth || disabled}
                  aria-label={iso}
                  aria-pressed={isSelected}
                  data-selected={isSelected ? "" : undefined}
                  onClick={() => pickDay(d)}
                  className={cn(
                    cellBase,
                    "size-9 rounded-full",
                    !inMonth && "invisible",
                    isSelected
                      ? "bg-primary font-medium text-primary-foreground"
                      : "text-foreground hover:bg-surface-hover",
                    isToday && !isSelected && "font-semibold text-primary",
                    dis && "cursor-not-allowed text-muted/40 hover:bg-transparent",
                  )}
                >
                  {d.date()}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {view === "month" && (
        <div className="grid w-[15.75rem] grid-cols-3 gap-1">
          {locale.months.map((label, i) => {
            const m = cursor.month(i);
            const dis = isDisabledMonth(m, picker, rules);
            const isSelected =
              selected != null &&
              picker === "month" &&
              formatValue(m, "month") === formatValue(selected, "month");
            return (
              <button
                key={label}
                type="button"
                disabled={dis || disabled}
                aria-pressed={isSelected}
                data-selected={isSelected ? "" : undefined}
                onClick={() => pickMonth(m)}
                className={cn(
                  cellBase,
                  "h-10",
                  isSelected
                    ? "bg-primary font-medium text-primary-foreground"
                    : "text-foreground hover:bg-surface-hover",
                  dis && "cursor-not-allowed text-muted/40 hover:bg-transparent",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {view === "year" && (
        <div className="grid w-[15.75rem] grid-cols-3 gap-1">
          {years.map((y) => {
            const dis = isDisabledYear(y, picker, rules);
            const isSelected = selected != null && picker === "year" && selected.year() === y;
            // 首尾两格属于邻近十年段，可点但弱化（同月历里的「上/下月补位日」）
            const outside = y < decade[0] || y > decade[1];
            return (
              <button
                key={y}
                type="button"
                disabled={dis || disabled}
                aria-pressed={isSelected}
                data-selected={isSelected ? "" : undefined}
                onClick={() => pickYear(y)}
                className={cn(
                  cellBase,
                  "h-10",
                  isSelected
                    ? "bg-primary font-medium text-primary-foreground"
                    : "text-foreground hover:bg-surface-hover",
                  outside && !isSelected && "text-muted",
                  dis && "cursor-not-allowed text-muted/40 hover:bg-transparent",
                )}
              >
                {y}
              </button>
            );
          })}
        </div>
      )}

      {showToday && (
        <div className="mt-2 border-t border-border pt-2 text-center">
          <button
            type="button"
            onClick={goToday}
            disabled={locked}
            className="rounded-md px-2 py-1 text-sm text-primary outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {picker === "date"
              ? locale.today
              : picker === "month"
              ? locale.thisMonth
              : locale.thisYear}
          </button>
        </div>
      )}
    </div>
  );
}
