import type { TreeNode } from "../tree/tree-core";

export interface TreeSelectProps {
  nodes: TreeNode[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  /**
   * 是否可清除（默认 `false`）。开启后有值且未禁用时，触发器右侧 hover/聚焦会浮出清除按钮，
   * 点击回到未选态：单选回传 `""`、多选回传 `[]`。
   * 用于「可留空的层级筛选维度」——留空即不限；与 Select 的 `clearable` 语义一致。
   */
  clearable?: boolean;
  searchable?: boolean;
  showLine?: boolean;
  className?: string;
}
