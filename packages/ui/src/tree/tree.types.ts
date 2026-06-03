import type { TreeNode } from "./tree-core";

export type { TreeNode };

export interface TreeProps {
  nodes: TreeNode[];
  // 展开（受控/非受控对称）
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onExpandedChange?: (keys: string[]) => void;
  // 单选高亮（非 checkable 模式）
  selectable?: boolean; // 默认 true
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelect?: (keys: string[], node: TreeNode) => void;
  // 勾选
  checkable?: boolean;
  checkedKeys?: string[];
  defaultCheckedKeys?: string[];
  onCheck?: (info: { checkedKeys: string[]; halfCheckedKeys: string[] }, node: TreeNode) => void;
  // 视觉/交互
  showLine?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  "aria-label"?: string;
}
