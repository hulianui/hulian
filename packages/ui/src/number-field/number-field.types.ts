import type { HTMLAttributes } from "react";

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 实现早就在往下展开 rest，此前只是类型把口封死了（#157）。
 */
export interface NumberFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** 受控值（null=空）。 */
  value?: number | null;
  /**
   * 非受控初始值（null=初始为空）。
   *
   * 与 `value` 一样收 `null`：底层一直支持「初始就是空」，此前只是类型把口封死了——
   * 于是「留空 = 沿用默认 / 继承上级」这类三态字段（null / 0 / 正整数）在非受控写法下
   * 表达不出 null 这一档，而受控写法（`value`）里它是合法的。两侧口径本就该一致。
   */
  defaultValue?: number | null;
  /** 瑚琏收敛签名（丢 Base UI eventDetails）。 */
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** 步进量，默认 1。 */
  step?: number;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
}
