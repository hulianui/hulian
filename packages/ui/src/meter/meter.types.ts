import type { ReactNode } from "react";

export interface MeterProps {
  /** 当前值（必填）。 */
  value: number;
  /** 下限，默认 0。 */
  min?: number;
  /** 上限，默认 100。 */
  max?: number;
  /**
   * 可选标签（如「磁盘用量」）。
   *
   * 这也是给 `role="meter"` 挂无障碍名的**唯一**途径（内部用 `aria-labelledby` 关联）。
   * 不传 label 就自绘一行标题的话，读屏念到的是一条无名度量条。
   */
  label?: ReactNode;
  /** 是否显示数值文案。默认按 `(value - min) / (max - min)` 渲染成百分比，与指示条同口径。 */
  showValue?: boolean;
  /**
   * 自定义数值文案。返回的字符串同时用于可见文字与 `aria-valuetext`，两者不会不一致。
   *
   * 用于绝对数表述：`({ value, max }) => `${value} / ${max} 道题``。
   * `percent` 是已按 min/max 归一并夹到 0–100 的百分数（未取整）。
   */
  formatValue?: (info: { value: number; min: number; max: number; percent: number }) => string;
  className?: string;
}
