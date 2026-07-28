import type { ReactNode } from "react";

/** 树节点数据。 */
export interface TreeNode {
  /** 唯一键；展开/选中/勾选态均以此标识。 */
  key: string;
  label: ReactNode;
  children?: TreeNode[];
  /** 只挡选中/勾选，不挡展开 —— 禁用节点的子树仍可浏览。 */
  disabled?: boolean;
  icon?: ReactNode;
  /**
   * 供搜索与首字母跳转使用的纯文本。
   * label 是 ReactNode（带高亮片段、图标、徽标…）时**必须给**，否则匹配会退化成拿 `key` 去比，
   * 用户按看得见的文字搜就搜不到。label 本身是字符串/数字时不必给。
   */
  searchText?: string;
}

/** 扁平化后的「可见行」，供 roving tabindex + 键盘 + 连接线渲染。 */
export interface FlatRow {
  key: string;
  node: TreeNode;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  disabled: boolean;
  parentKey: string | null;
  /** 在同级兄弟中是否末项（连接线 L 形 / 竖线断续用）。 */
  isLast: boolean;
  /** 各祖先层是否末项，length === depth（祖先末项处竖线不再延伸）。 */
  ancestorIsLast: boolean[];
}

/** 预计算索引，三件共享（一次 useMemo）。 */
export interface TreeIndex {
  nodeMap: Map<string, TreeNode>;
  parentMap: Map<string, string | null>;
  /** 直接子 key（含 disabled，渲染列用）。 */
  childrenKeys: Map<string, string[]>;
  /** 全部「启用叶」后代 key；启用叶自身映射到 [自身]（勾选真源计算用）。 */
  leafDescendants: Map<string, string[]>;
}

export function buildIndex(nodes: TreeNode[]): TreeIndex {
  const nodeMap = new Map<string, TreeNode>();
  const parentMap = new Map<string, string | null>();
  const childrenKeys = new Map<string, string[]>();
  const leafDescendants = new Map<string, string[]>();

  const walk = (list: TreeNode[], parent: string | null): string[] => {
    // 返回 list 整体贡献的「启用叶」key（供上层累计）。
    const leaves: string[] = [];
    for (const node of list) {
      nodeMap.set(node.key, node);
      parentMap.set(node.key, parent);
      const kids = node.children ?? [];
      childrenKeys.set(
        node.key,
        kids.map((k) => k.key),
      );
      if (kids.length) {
        const subLeaves = walk(kids, node.key);
        leafDescendants.set(node.key, subLeaves);
        leaves.push(...subLeaves);
      } else {
        // 叶节点：启用则自身是一片启用叶，否则空。
        const self = node.disabled ? [] : [node.key];
        leafDescendants.set(node.key, self);
        leaves.push(...self);
      }
    }
    return leaves;
  };

  walk(nodes, null);
  return { nodeMap, parentMap, childrenKeys, leafDescendants };
}

export function flattenVisible(nodes: TreeNode[], expandedSet: Set<string>): FlatRow[] {
  const out: FlatRow[] = [];
  const walk = (list: TreeNode[], depth: number, parentKey: string | null, ancestorIsLast: boolean[]) => {
    list.forEach((node, i) => {
      const hasChildren = !!node.children?.length;
      const expanded = hasChildren && expandedSet.has(node.key);
      const isLast = i === list.length - 1;
      out.push({
        key: node.key,
        node,
        depth,
        hasChildren,
        expanded,
        disabled: !!node.disabled,
        parentKey,
        isLast,
        ancestorIsLast,
      });
      if (expanded) walk(node.children!, depth + 1, node.key, [...ancestorIsLast, isLast]);
    });
  };
  walk(nodes, 0, null, []);
  return out;
}

export function getNodePath(nodes: TreeNode[], key: string): TreeNode[] {
  const path: TreeNode[] = [];
  const dfs = (list: TreeNode[]): boolean => {
    for (const node of list) {
      path.push(node);
      if (node.key === key) return true;
      if (node.children?.length && dfs(node.children)) return true;
      path.pop();
    }
    return false;
  };
  dfs(nodes);
  return path;
}

export type CheckState = "checked" | "indeterminate" | "unchecked";

export function toggleChecked(
  key: string,
  checked: boolean,
  leafSet: Set<string>,
  index: TreeIndex,
): Set<string> {
  const next = new Set(leafSet);
  const leaves = index.leafDescendants.get(key) ?? [];
  for (const leaf of leaves) {
    if (checked) next.add(leaf);
    else next.delete(leaf);
  }
  return next;
}

export function getCheckState(key: string, leafSet: Set<string>, index: TreeIndex): CheckState {
  const leaves = index.leafDescendants.get(key) ?? [];
  if (leaves.length === 0) return "unchecked"; // 无启用叶（如全 disabled 枝 / disabled 叶）
  let checked = 0;
  for (const leaf of leaves) if (leafSet.has(leaf)) checked++;
  if (checked === 0) return "unchecked";
  if (checked === leaves.length) return "checked";
  return "indeterminate";
}

export function normalizeCheckedToLeaves(checkedKeys: string[], index: TreeIndex): Set<string> {
  const leaves = new Set<string>();
  for (const key of checkedKeys) {
    for (const leaf of index.leafDescendants.get(key) ?? []) leaves.add(leaf);
  }
  return leaves;
}

export function computeChecked(
  leafSet: Set<string>,
  index: TreeIndex,
): { checkedKeys: string[]; halfCheckedKeys: string[] } {
  const checkedKeys: string[] = [];
  const halfCheckedKeys: string[] = [];
  for (const key of index.nodeMap.keys()) {
    const state = getCheckState(key, leafSet, index);
    if (state === "checked") checkedKeys.push(key);
    else if (state === "indeterminate") halfCheckedKeys.push(key);
  }
  return { checkedKeys, halfCheckedKeys };
}

/**
 * 节点的可搜索文本（已小写）。取值顺序：`searchText` → 字符串/数字 label → `key` 兜底。
 * 搜索与键盘首字母跳转共用同一条口径，避免两处规则漂移。
 */
export function nodeSearchText(node: TreeNode): string {
  if (typeof node.searchText === "string") return node.searchText.toLowerCase();
  if (typeof node.label === "string" || typeof node.label === "number") {
    return String(node.label).toLowerCase();
  }
  return node.key.toLowerCase();
}

export function filterTree(
  nodes: TreeNode[],
  query: string,
): { matchedKeys: Set<string>; autoExpandKeys: Set<string> } {
  const matchedKeys = new Set<string>();
  const autoExpandKeys = new Set<string>();
  const q = query.trim().toLowerCase();
  if (!q) return { matchedKeys, autoExpandKeys };

  const labelText = (node: TreeNode): string => nodeSearchText(node);

  const dfs = (list: TreeNode[], ancestors: string[]): boolean => {
    let anyMatch = false;
    for (const node of list) {
      const selfMatch = labelText(node).includes(q);
      const childMatch = node.children?.length ? dfs(node.children, [...ancestors, node.key]) : false;
      if (selfMatch) matchedKeys.add(node.key);
      if (selfMatch || childMatch) {
        anyMatch = true;
        // 命中节点的祖先全部自动展开
        if (selfMatch) for (const a of ancestors) autoExpandKeys.add(a);
        if (childMatch) autoExpandKeys.add(node.key);
      }
    }
    return anyMatch;
  };
  dfs(nodes, []);
  return { matchedKeys, autoExpandKeys };
}
