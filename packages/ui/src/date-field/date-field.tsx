"use client";
import { useState } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { Calendar, ChevronLeft, ChevronRight, X } from "../_icons";
import { cn } from "../lib/cn";
import {
  DATE_FORMAT,
  dayjs,
  type Dayjs,
  MONTH_FORMAT,
  monthMatrix,
  normISODate as normISO,
  toISODate as toISO,
  WEEKDAY_LABELS as WEEKDAYS,
  YEAR_FORMAT,
  yearMatrix,
} from "../lib/date";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { DateFieldPicker, DateFieldProps } from "./date-field.types";

// 零依赖单日期选择器：Base UI Popover + dayjs，与 DateRangePicker 同源（共用 lib/date 的
// monthMatrix / WEEKDAY_LABELS）。库里此前只有 _mui 那份 MUI X 桥的 DatePicker，
// 想选单个日期就得把整条 MUI + emotion 拖进来，还得记得挂 MuiBridgeProvider。
//
// 三种粒度共用一套面板：内部 view 在 date → month → year 之间下钻/上卷，
// picker 决定「点到哪一层就提交」。

// 与 popover.tsx 同款：transition 简写避免与 Base UI 内联长写混用触发 React shorthand 警告。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

const MONTH_LABELS = ["1 月", "2 月", "3 月", "4 月", "5 月", "6 月", "7 月", "8 月", "9 月", "10 月", "11 月", "12 月"];

const PICKER_FORMAT: Record<DateFieldPicker, string> = {
  date: DATE_FORMAT,
  month: MONTH_FORMAT,
  year: YEAR_FORMAT,
};

const PICKER_PLACEHOLDER: Record<DateFieldPicker, string> = {
  date: "选择日期",
  month: "选择月份",
  year: "选择年份",
};

const TODAY_LABEL: Record<DateFieldPicker, string> = { date: "今天", month: "本月", year: "今年" };

/** 对外值 → Dayjs。粒度不同解析口径也不同（"2026-07" 直接给 dayjs 也能解，但显式补日更稳）。 */
function parseValue(v: string | null | undefined, picker: DateFieldPicker): Dayjs | null {
  if (!v) return null;
  const d =
    picker === "year" ? dayjs(`${v}-01-01`) : picker === "month" ? dayjs(`${v}-01`) : dayjs(v);
  return d.isValid() ? d : null;
}

/** Dayjs → 对外值，形状随粒度。 */
function formatValue(d: Dayjs, picker: DateFieldPicker): string {
  return d.format(PICKER_FORMAT[picker]);
}

const navBtn =
  "rounded-md p-1 text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40";

export function DateField({
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
}: DateFieldProps) {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState<string | null>(defaultValue ?? null);
  const value = isControlled ? (valueProp ?? null) : internal;
  const selected = parseValue(value, picker);

  const [open, setOpen] = useState(false);
  // 面板当前展示的层级。picker 决定它的起点与「点了就提交」的那一层。
  const [view, setView] = useState<DateFieldPicker>(picker);
  const [cursor, setCursor] = useState<Dayjs>(() => selected ?? dayjs());

  const min = normISO(minDate);
  const max = normISO(maxDate);
  const today = dayjs();
  const todayISO = toISO(today);

  /** 单日禁用判定；月/年粒度传该月/该年首日。 */
  function isDisabledDay(iso: string): boolean {
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return disabledDate?.(iso) ?? false;
  }

  /** 整月是否全禁（月面板灰掉用）：逐日判太贵，只看该月与 [min,max] 有无交集 + 首日的自定义判定。 */
  function isDisabledMonth(m: Dayjs): boolean {
    const first = toISO(m.startOf("month"));
    const last = toISO(m.endOf("month"));
    if (min && last < min) return true;
    if (max && first > max) return true;
    return picker === "month" ? (disabledDate?.(first) ?? false) : false;
  }

  function isDisabledYear(y: number): boolean {
    const first = `${y}-01-01`;
    const last = `${y}-12-31`;
    if (min && last < min) return true;
    if (max && first > max) return true;
    return picker === "year" ? (disabledDate?.(first) ?? false) : false;
  }

  function commit(next: string | null) {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  }

  function handleOpenChange(next: boolean) {
    if (disabled) return;
    setOpen(next);
    if (next) {
      // 打开时把面板对齐到当前值（无值则今天），并回到 picker 对应的起始层
      setCursor(selected ?? dayjs());
      setView(picker);
    }
  }

  function pickDay(d: Dayjs) {
    if (readOnly || isDisabledDay(toISO(d))) return;
    commit(formatValue(d, picker));
    setOpen(false);
  }

  function pickMonth(m: Dayjs) {
    if (readOnly || isDisabledMonth(m)) return;
    setCursor(m);
    // month 粒度到此为止；date 粒度只是下钻一层
    if (picker === "month") {
      commit(formatValue(m, picker));
      setOpen(false);
      return;
    }
    setView("date");
  }

  function pickYear(y: number) {
    if (readOnly || isDisabledYear(y)) return;
    const next = cursor.year(y);
    setCursor(next);
    if (picker === "year") {
      commit(formatValue(next, picker));
      setOpen(false);
      return;
    }
    setView("month");
  }

  function goToday() {
    if (readOnly) return;
    if (picker === "date" && isDisabledDay(todayISO)) return;
    commit(formatValue(today, picker));
    setCursor(today);
    setOpen(false);
  }

  function clearValue(e: React.MouseEvent) {
    e.stopPropagation();
    commit(null);
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
      ? cursor.format("YYYY 年 M 月")
      : view === "month"
        ? cursor.format("YYYY 年")
        : `${decade[0]} - ${decade[1]}`;

  // 标题可点：date → month → year 逐层上卷。year 层已是顶，不再可点。
  const headerUp = view === "date" ? "month" : view === "month" ? "year" : null;

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
              <Calendar className="size-4 shrink-0 text-muted" aria-hidden />
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
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            )}
            style={overlayTransition}
          >
            <div className="mb-1 flex items-center justify-between gap-2 px-1">
              <button type="button" aria-label="上一页" onClick={() => step(-1)} className={navBtn}>
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                disabled={headerUp == null}
                onClick={() => headerUp && setView(headerUp)}
                className={cn(
                  "rounded-md px-2 py-1 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30",
                  headerUp ? "hover:bg-surface-hover" : "cursor-default",
                )}
              >
                {headerTitle}
              </button>
              <button type="button" aria-label="下一页" onClick={() => step(1)} className={navBtn}>
                <ChevronRight className="size-4" />
              </button>
            </div>

            {view === "date" && (
              <div className="grid w-[15.75rem] grid-cols-7">
                {WEEKDAYS.map((w) => (
                  <div key={w} className="flex h-8 items-center justify-center text-xs text-muted">
                    {w}
                  </div>
                ))}
                {monthMatrix(cursor).map((d) => {
                  const iso = toISO(d);
                  const inMonth = d.month() === cursor.month();
                  const dis = isDisabledDay(iso);
                  const isSelected = selected != null && picker === "date" && iso === toISO(selected);
                  const isToday = iso === todayISO;
                  return (
                    <div key={iso} className="flex h-9 items-center justify-center">
                      <button
                        type="button"
                        disabled={dis || !inMonth}
                        aria-label={iso}
                        aria-pressed={isSelected}
                        data-selected={isSelected ? "" : undefined}
                        onClick={() => pickDay(d)}
                        className={cn(
                          "flex size-9 items-center justify-center rounded-full text-sm transition-colors",
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
                {MONTH_LABELS.map((label, i) => {
                  const m = cursor.month(i);
                  const dis = isDisabledMonth(m);
                  const isSelected =
                    selected != null && picker === "month" && formatValue(m, "month") === formatValue(selected, "month");
                  return (
                    <button
                      key={label}
                      type="button"
                      disabled={dis}
                      aria-pressed={isSelected}
                      data-selected={isSelected ? "" : undefined}
                      onClick={() => pickMonth(m)}
                      className={cn(
                        "flex h-10 items-center justify-center rounded-md text-sm transition-colors",
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
                  const dis = isDisabledYear(y);
                  const isSelected = selected != null && picker === "year" && selected.year() === y;
                  // 首尾两格属于邻近十年段，可点但弱化（同月历里的「上/下月补位日」）
                  const outside = y < decade[0] || y > decade[1];
                  return (
                    <button
                      key={y}
                      type="button"
                      disabled={dis}
                      aria-pressed={isSelected}
                      data-selected={isSelected ? "" : undefined}
                      onClick={() => pickYear(y)}
                      className={cn(
                        "flex h-10 items-center justify-center rounded-md text-sm transition-colors",
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
                  disabled={readOnly}
                  className="rounded-md px-2 py-1 text-sm text-primary outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {TODAY_LABEL[picker]}
                </button>
              </div>
            )}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
