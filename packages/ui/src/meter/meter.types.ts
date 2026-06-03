import type { ReactNode } from "react";

export interface MeterProps {
  /** 当前值（必填）。 */
  value: number;
  /** 下限，默认 0。 */
  min?: number;
  /** 上限，默认 100。 */
  max?: number;
  /** 可选标签（如「磁盘用量」）。 */
  label?: ReactNode;
  /** 是否显示格式化数值。 */
  showValue?: boolean;
  className?: string;
}
