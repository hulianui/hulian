/**
 * 对外受控值：ISO 日期字符串数组 [start, end]，格式恒为 "YYYY-MM-DD"（与既有日期族 ISO 受控范式一致）。
 * null 表示未选择。
 */
export type DateRangeValue = [string, string];

export interface DateRangePreset {
  label: string;
  /** 返回 ISO 日期数组 [start, end]（YYYY-MM-DD）。点击时调用，可基于"今天"动态计算。 */
  getValue: () => DateRangeValue;
}

export interface DateRangePickerProps {
  /** 受控值 [start, end]（ISO YYYY-MM-DD）；null = 已清空。传入即受控。 */
  value?: DateRangeValue | null;
  /** 非受控初始值。 */
  defaultValue?: DateRangeValue | null;
  /** 区间变化（含清空 → null）。 */
  onValueChange?: (range: DateRangeValue | null) => void;
  /** 触发器尺寸档，刻度与 `Input` 一致（32 / 40 / 48px）；面板日期格几何不随之变化。@default "md" */
  size?: "sm" | "md" | "lg";
  /** 最早可选日（ISO），早于此禁选。 */
  minDate?: string;
  /** 最晚可选日（ISO），晚于此禁选。 */
  maxDate?: string;
  /** 自定义禁用某天，入参为 ISO YYYY-MM-DD。 */
  disabledDate?: (isoDate: string) => boolean;
  /** 快捷预设：true / 省略 = 默认四项(今天/最近7天/最近30天/本月)；数组 = 自定义；false = 隐藏。 */
  presets?: boolean | DateRangePreset[];
  /** 占位文案 [开始, 结束]，默认 ["开始日期","结束日期"]。 */
  placeholder?: [string, string];
  /** 展示格式（dayjs format），默认 "YYYY-MM-DD"；对外受控值始终为 ISO YYYY-MM-DD。 */
  displayFormat?: string;
  disabled?: boolean;
  /** 只读：可打开查看但不可改动（无端点选择、无预设、无清除）。 */
  readOnly?: boolean;
  className?: string;
}
