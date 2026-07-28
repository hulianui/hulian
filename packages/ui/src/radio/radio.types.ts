import type { ReactNode } from "react";

export interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  /** 仅控布局，默认 vertical。 */
  orientation?: "vertical" | "horizontal";
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}

export interface RadioProps {
  /** 必填，标识该选项。 */
  value: string;
  disabled?: boolean;
  /** 可选 inline label（点右，<label> 原生关联）。 */
  label?: ReactNode;
  id?: string;
  /** 落在点 Radio.Root。 */
  className?: string;
  /**
   * 无障碍名。**不给 label、或 label 是图标/纯视觉内容时必须给** ——
   * 否则读屏用户听到的只是「单选按钮」，拿不到这是哪个选项。
   */
  "aria-label"?: string;
  /** 用页面上已有元素充当名字（填其 id）。与 aria-label 二选一。 */
  "aria-labelledby"?: string;
  /** 补充描述（填元素 id），如该选项的说明文字。 */
  "aria-describedby"?: string;
}
