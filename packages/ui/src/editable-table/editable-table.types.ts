import type { ReactNode } from "react";

export interface EditableColumn<T> {
  /** 数据键。 */
  key: keyof T & string;
  title: ReactNode;
  /** 是否可编辑（默认 false=只读列，编辑态也展示原值）。 */
  editable?: boolean;
  /** 展示态渲染（默认直接渲染该键的值）。 */
  render?: (value: T[keyof T], row: T) => ReactNode;
  /** 编辑态编辑器（默认文本 Input）。onChange 写回草稿对应键。 */
  editor?: (value: unknown, onChange: (v: unknown) => void, row: T) => ReactNode;
  /** 列宽（px）。 */
  width?: number;
  /** 单元格对齐。 */
  align?: "left" | "center" | "right";
}

export interface EditableTableProps<T> {
  columns: EditableColumn<T>[];
  data: T[];
  /** 行稳定 key。 */
  rowKey: (row: T) => string;
  /** 任一提交/删除/新增后回传完整新数据（受控数据源）。 */
  onChange?: (next: T[]) => void;
  /** 显示「新增一行」按钮（需配合 newRow）。 */
  addable?: boolean;
  /** 新行工厂；新增后该行自动进入编辑态。 */
  newRow?: () => T;
  /** 每行可删除。 */
  deletable?: boolean;
  /** 保存前校验整行，返回错误信息则拦截保存（行内提示由消费者自理，这里仅阻断）。 */
  validateRow?: (row: T) => boolean;
  className?: string;
}
