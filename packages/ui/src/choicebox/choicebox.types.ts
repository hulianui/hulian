import type { ReactNode } from "react";

export interface ChoiceboxGroupProps {
  /** 受控值。单选为 string，多选为 string[]。 */
  value?: string | string[];
  /** 非受控初值。 */
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  /** true=多选(checkbox 语义) / false=单选(radio 语义)。@default false */
  multiple?: boolean;
  /** radio 分组 name（单选必需，省略自动生成）。 */
  name?: string;
  /** 网格列数。@default 1 */
  columns?: number;
  /** 整组禁用。 */
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
}

export interface ChoiceboxProps {
  /** 选项值（组内唯一）。 */
  value: string;
  /** 主标题。 */
  title?: ReactNode;
  /** 副描述。 */
  description?: ReactNode;
  /** 左侧图标。 */
  icon?: ReactNode;
  /** 标题/描述之外的附加内容（如价格、标签）。 */
  children?: ReactNode;
  disabled?: boolean;
  className?: string;
}
