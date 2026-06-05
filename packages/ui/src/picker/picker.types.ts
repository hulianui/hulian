import type { ReactNode } from "react";

export interface PickerOption {
  label: ReactNode;
  value: string;
}

export interface PickerColumn {
  options: PickerOption[];
  /** 列宽 flex 比重，默认 1。 */
  flex?: number;
}

export interface PickerProps {
  columns: PickerColumn[];
  /** 各列选中值数组（受控）。 */
  value?: string[];
  /** 非受控初始值，缺省取各列首项。 */
  defaultValue?: string[];
  /** 某列选定后回调（完整值数组 + 变化的列下标）。 */
  onChange?: (value: string[], columnIndex: number) => void;
  /** 可见行数（建议奇数），默认 5。 */
  visibleCount?: number;
  /** 行高 px，默认 40。 */
  itemHeight?: number;
  className?: string;
}
