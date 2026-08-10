import type { HTMLAttributes } from "react";

/** 选择粒度。决定对外值的形状，以及面板点到哪一层算提交。 */
export type CalendarPicker = "date" | "month" | "year";

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 表单受控件必须能接 react-hook-form 的 `Controller` —— 尤其 `field.onBlur` 传不进去时
 * `touchedFields` 永不更新、`mode: "onBlur"` 的表单静默失效（#157）。
 */
export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /**
   * 受控值。形状随 `picker` 变化：
   * `"date"` → `"YYYY-MM-DD"`；`"month"` → `"YYYY-MM"`；`"year"` → `"YYYY"`。
   * 定宽文本 → 字典序即时间序，区间比较可直接比字符串，避开时区/UTC 日界坑。
   */
  value?: string | null;
  /** 非受控初始值，形状同 `value`。 */
  defaultValue?: string | null;
  /** 选中回调。面板内的下钻（年→月→日）不会触发，只有真正选到 `picker` 那一层才回调。 */
  onValueChange?: (value: string) => void;
  /** 选择粒度。@default "date" */
  picker?: CalendarPicker;
  /** 面板初始停留的月份（任意可解析日期串）。不传时取 `value` ?? 今天。之后由内部导航接管。 */
  defaultMonth?: string;
  /** 可选最早日期（任意可解析日期串，内部规范化）。 */
  minDate?: string;
  /** 可选最晚日期。 */
  maxDate?: string;
  /**
   * 逐日禁用判定，入参恒为 `"YYYY-MM-DD"`（`month`/`year` 粒度下传该月/该年的首日）。
   * 与 `minDate`/`maxDate` 是「或」关系：任一命中即禁用。
   */
  disabledDate?: (isoDate: string) => boolean;
  /** 底部的「今天 / 本月 / 今年」快捷按钮。@default true */
  showToday?: boolean;
  /** 整个面板禁用（不可点、不可翻页）。 */
  disabled?: boolean;
  /** 只读：可翻页浏览，但选不动。 */
  readOnly?: boolean;
  /** 面板无障碍名。@default "日历" */
  "aria-label"?: string;
  className?: string;
}
