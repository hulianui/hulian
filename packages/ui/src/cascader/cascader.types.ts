import type { TreeNode } from "../tree/tree-core";

export interface CascaderProps {
  nodes: TreeNode[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (path: string[], nodes: TreeNode[]) => void;
  expandTrigger?: "click" | "hover";
  changeOnSelect?: boolean;
  /** 浮层顶部出搜索框：输入时把树扁平成叶子路径模糊匹配，命中以扁平行展示，选中即提交全路径。 */
  showSearch?: boolean;
  searchPlaceholder?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}
