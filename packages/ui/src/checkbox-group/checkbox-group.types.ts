import type { ReactNode } from "react";

export interface CheckboxGroupProps {
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
