import type { HTMLAttributes } from "react";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  /** 当前值；省略/undefined → indeterminate 不定态 */
  value?: number;
  /** 最大值，默认 100 */
  max?: number;
  /** 形态，默认 "linear" */
  variant?: "linear" | "circular";
  /** 进度色调，默认 "primary" */
  tone?: "primary" | "danger" | "success" | "warning";
  /** circular 直径 px，默认 40（linear 忽略） */
  size?: number;
  /** circular 描边 px，默认 4（linear 忽略） */
  thickness?: number;
  /** 显示百分比标签（circular 居中 / linear 右侧），默认 false；indeterminate 不显示 */
  showValue?: boolean;
}
