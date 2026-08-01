import { DATE_FORMAT, dayjs, type Dayjs, MONTH_FORMAT, toISODate as toISO, YEAR_FORMAT } from "../lib/date";
import type { CalendarPicker } from "./calendar.types";

// Calendar 与 DatePicker 共用的纯逻辑。抽在这里有两个原因：
//   1. 两个组件必须对「值长什么样」完全一致 —— 面板提交的字符串就是输入框显示的那个，
//      各写一份迟早漂移。
//   2. 禁用判定是这一族最容易出错的地方（边界含不含、月/年粒度按哪天判），纯函数才好单测。

export const PICKER_FORMAT: Record<CalendarPicker, string> = {
  date: DATE_FORMAT,
  month: MONTH_FORMAT,
  year: YEAR_FORMAT,
};

export const PICKER_PLACEHOLDER: Record<CalendarPicker, string> = {
  date: "选择日期",
  month: "选择月份",
  year: "选择年份",
};

export const TODAY_LABEL: Record<CalendarPicker, string> = { date: "今天", month: "本月", year: "今年" };

export const MONTH_LABELS = [
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
];

/**
 * 对外值 → Dayjs。粒度不同解析口径也不同：`"2026-07"` 直接丢给 dayjs 也能解，
 * 但显式补到首日更稳（不同 dayjs 版本对不完整日期串的容忍度不一样）。
 */
export function parseValue(v: string | null | undefined, picker: CalendarPicker): Dayjs | null {
  if (!v) return null;
  const d = picker === "year" ? dayjs(`${v}-01-01`) : picker === "month" ? dayjs(`${v}-01`) : dayjs(v);
  return d.isValid() ? d : null;
}

/** Dayjs → 对外值，形状随粒度（定宽文本，字典序即时间序）。 */
export function formatValue(d: Dayjs, picker: CalendarPicker): string {
  return d.format(PICKER_FORMAT[picker]);
}

/** min/max/disabledDate 三者的合成判定，`iso` 恒为 `"YYYY-MM-DD"`。边界是**含**的。 */
export interface DisableRules {
  min?: string;
  max?: string;
  disabledDate?: (isoDate: string) => boolean;
}

export function isDisabledDay(iso: string, rules: DisableRules): boolean {
  if (rules.min && iso < rules.min) return true;
  if (rules.max && iso > rules.max) return true;
  return rules.disabledDate?.(iso) ?? false;
}

/**
 * 整月是否全禁（月面板灰掉用）。逐日调 disabledDate 太贵，只看该月与 [min,max] 有无交集；
 * 自定义判定仅在 `month` 粒度下按该月首日问一次 —— 因为只有那时「点这一格」才等于选中该月。
 */
export function isDisabledMonth(m: Dayjs, picker: CalendarPicker, rules: DisableRules): boolean {
  const first = toISO(m.startOf("month"));
  const last = toISO(m.endOf("month"));
  if (rules.min && last < rules.min) return true;
  if (rules.max && first > rules.max) return true;
  return picker === "month" ? (rules.disabledDate?.(first) ?? false) : false;
}

export function isDisabledYear(y: number, picker: CalendarPicker, rules: DisableRules): boolean {
  const first = `${y}-01-01`;
  const last = `${y}-12-31`;
  if (rules.min && last < rules.min) return true;
  if (rules.max && first > rules.max) return true;
  return picker === "year" ? (rules.disabledDate?.(first) ?? false) : false;
}
