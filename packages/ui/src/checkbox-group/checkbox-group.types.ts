import type { HTMLAttributes, ReactNode } from "react";

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 表单受控件必须能接 react-hook-form 的 `Controller` —— 尤其 `field.onBlur` 传不进去时
 * `touchedFields` 永不更新、`mode: "onBlur"` 的表单静默失效（#157）。
 */
export interface CheckboxGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  /** 受控：已勾选项的 value 数组。 */
  value?: string[];
  /** 非受控初始勾选项。 */
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** 下发禁用到组内全部 Checkbox。 */
  disabled?: boolean;
  /** 排列方向：竖排（默认）/ 横排。 */
  orientation?: "vertical" | "horizontal";
  className?: string;
  /** 子项为瑚琏 Checkbox（每个带 value；CheckboxGroup 按 value 匹配成员）。 */
  children?: ReactNode;
  "aria-label"?: string;
}
