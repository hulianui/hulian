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
  /**
   * 什么东西触发展开/收起，默认 `"row"`（点整行）。
   * `"row"` 下有子节点的行点了只会展开，**永远选不中**——需要选中父节点（选目录、选部门、
   * 选任意层级的分类）就改 `"icon"`：只有左侧箭头管展开，行的其余部分照常 select / check。
   * 两种模式下键盘都一样：方向键展开收起、Enter/Space 执行行动作。
   */
  expandTrigger?: "row" | "icon";
  // 视觉/交互
  showLine?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  "aria-label"?: string;
}
