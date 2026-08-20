import type { ComponentPropsWithoutRef } from "react";
import type { CalendarPicker } from "../calendar/calendar.types";

/**
 * 对外受控值：定宽文本数组 [start, end]。形状随 `picker` 变化，与 `DatePicker` / `Calendar` 同源：
 * `"date"` → `"YYYY-MM-DD"`；`"month"` → `"YYYY-MM"`；`"year"` → `"YYYY"`。
 * 定宽 → 字典序即时间序，区间比较可直接比字符串（与既有日期族 ISO 受控范式一致）。
 * null 表示未选择。
 */
export type DateRangeValue = [string, string];

export interface DateRangePreset {
  label: string;
  /** 返回 ISO 日期数组 [start, end]（YYYY-MM-DD）。点击时调用，可基于"今天"动态计算。 */
  getValue: () => DateRangeValue;
}

/**
 * 未列出的原生属性（`aria-*` / `data-*` / `id` / `title` / `onBlur` …）落到**触发器按钮**上 ——
 * 读屏念的、能聚焦的都是它。`Field required` 注进来的 `aria-required` 也走这条路（#293）。
 */
export interface DateRangePickerProps
  extends Omit<
    ComponentPropsWithoutRef<"button">,
    "value" | "defaultValue" | "onChange" | "placeholder" | "disabled" | "className" | "children" | "role"
  > {
  /** 受控值 [start, end]（ISO YYYY-MM-DD）；null = 已清空。传入即受控。 */
  value?: DateRangeValue | null;
  /** 非受控初始值。 */
  defaultValue?: DateRangeValue | null;
  /** 区间变化（含清空 → null）。 */
  onValueChange?: (range: DateRangeValue | null) => void;
  /**
   * 选择粒度，与 `DatePicker` 的同名 prop 同义（对标 el-date-picker 的 `daterange` /
   * `monthrange`）。决定值的形状与面板形态：
   * `"date"` 两个月历、`"month"` 两个年面板（各 12 个月）、`"year"` 两个 12 年段。
   * @default "date"
   */
  picker?: CalendarPicker;
  /** 触发器尺寸档，刻度与 `Input` 一致（32 / 40 / 48px）；面板日期格几何不随之变化。@default "md" */
  size?: "sm" | "md" | "lg";
  /**
   * 最早可选日，恒为 ISO 日期 `"YYYY-MM-DD"`（**不随 `picker` 变**，与 `DatePicker` 同口径）。
   * 月 / 年粒度下按「整段都超界才禁」判定：`maxDate` 落在某月中间时，那个月仍可选。
   */
  minDate?: string;
  /** 最晚可选日，口径同 `minDate`。 */
  maxDate?: string;
  /**
   * 自定义禁用。入参恒为 ISO 日期 `"YYYY-MM-DD"`；月 / 年粒度下只按该段**首日**问一次
   * （只有那时「点这一格」才等于选中该月 / 该年）。
   */
  disabledDate?: (isoDate: string) => boolean;
  /**
   * 快捷预设：true / 省略 = 该粒度的默认档；数组 = 自定义；false = 隐藏。
   * 默认档随 `picker`：日 = 今天 / 最近 7 天 / 最近 30 天 / 本月；
   * 月 = 本月 / 近 3 个月 / 近 6 个月 / 今年；年 = 今年 / 近 3 年 / 近 5 年。
   */
  presets?: boolean | DateRangePreset[];
  /** 占位文案 [开始, 结束]，默认随 `picker`（开始日期 / 开始月份 / 开始年份）。 */
  placeholder?: [string, string];
  /** 展示格式（dayjs format），默认随 `picker`（YYYY-MM-DD / YYYY-MM / YYYY）；对外受控值形状不受它影响。 */
  displayFormat?: string;
  disabled?: boolean;
  /** 只读：可打开查看但不可改动（无端点选择、无预设、无清除）。 */
  readOnly?: boolean;
  className?: string;
}
