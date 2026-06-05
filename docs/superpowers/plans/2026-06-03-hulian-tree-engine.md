# 瑚琏树引擎族 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 自研一套递归树引擎（零依赖），派生 Tree / TreeSelect / Cascader 三件，计 3 个组件 slug。

**Architecture:** 两层分解。Layer A `tree/tree-core.ts` 是零 React 纯逻辑核（类型/索引/扁平化/勾选级联/路径/搜索），三件共享。Layer B `<Tree>` 渲染缩进递归树（roving + 键盘 + grid-rows 过渡 + checkable + 连接线 + 搜索）。TreeSelect = Base UI Popover 浮层 + 内嵌 Tree；Cascader = Layer A 核 + 横向逐级面板列。复用 nav-menu 验证过的范式但不重构它。

**Tech Stack:** React 19 + TypeScript + Tailwind v4 + class-variance-authority + Base UI rc.0（仅 Popover 借定位）+ lucide-react + Vitest/jsdom。瑚琏既有：`cn`、`motionDurationCss/motionEaseCss`、`Checkbox`、`Chip`。

**参照先例（动手前读）：**
- `packages/ui/src/nav-menu/nav-menu.tsx` — flattenVisible/roving/键盘/grid-rows 过渡范式
- `packages/ui/src/listbox/listbox.tsx` — typeahead/step/edge 肌肉
- `packages/ui/src/select/select.tsx` + `popover/popover.tsx` — Popover overlay 装配 + motion token 过渡
- `packages/ui/src/checkbox/checkbox.tsx` — indeterminate 三态
- `packages/ui/src/nav-menu/nav-menu.showcase.tsx` + `showcase/types.ts` — ShowcaseSpec 格式

---

## File Structure

```
packages/ui/src/tree/
  tree-core.ts            # Layer A 纯逻辑（Task 1+2）
  tree-core.test.ts       # Layer A 单测（Task 1+2）
  tree.types.ts           # Tree props 类型（Task 3）
  tree.tsx                # Layer B <Tree>（Task 3）
  tree.test.tsx           # Tree 组件单测（Task 3）
  tree.showcase.tsx       # ShowcaseSpec（Task 4）
  index.ts                # 桶导出（Task 4）
packages/ui/src/tree-select/
  tree-select.types.ts    # （Task 5）
  tree-select.tsx         # （Task 5）
  tree-select.test.tsx    # （Task 5）
  tree-select.showcase.tsx# （Task 5）
  index.ts                # （Task 5）
packages/ui/src/cascader/
  cascader.types.ts       # （Task 6）
  cascader.tsx            # （Task 6）
  cascader.test.tsx       # （Task 6）
  cascader.showcase.tsx   # （Task 6）
  index.ts                # （Task 6）
packages/ui/src/index.ts          # 主桶 export（Task 4/5/6）
apps/www/lib/manifest.ts          # 3 行（Task 4/5/6）
apps/www/lib/registry.tsx         # 3 import+map（Task 4/5/6）
```

命令前缀：仓库根 `/Users/zhangzhiwei/Desktop/code/hulian`。UI 包测试：`pnpm --filter @hulianui/ui test -- --run <file>`。

---

## Task 1: tree-core 类型 + 索引 + 扁平化 + 路径

**Files:**
- Create: `packages/ui/src/tree/tree-core.ts`
- Test: `packages/ui/src/tree/tree-core.test.ts`

- [ ] **Step 1: 写失败测试**

`packages/ui/src/tree/tree-core.test.ts`：
```ts
import { describe, expect, it } from "vitest";
import { buildIndex, flattenVisible, getNodePath, type TreeNode } from "./tree-core";

const NODES: TreeNode[] = [
  {
    key: "a",
    label: "A",
    children: [
      { key: "a1", label: "A1" },
      { key: "a2", label: "A2", children: [{ key: "a2x", label: "A2X" }] },
    ],
  },
  { key: "b", label: "B", disabled: true },
  { key: "c", label: "C", children: [{ key: "c1", label: "C1", disabled: true }] },
];

describe("buildIndex", () => {
  it("建 parent/children/leafDescendants 表", () => {
    const idx = buildIndex(NODES);
    expect(idx.parentMap.get("a2x")).toBe("a2");
    expect(idx.parentMap.get("a")).toBeNull();
    expect(idx.childrenKeys.get("a")).toEqual(["a1", "a2"]);
    // leafDescendants 只含启用叶；a 下 a1 + a2x（a2 是枝不计；都启用）
    expect(idx.leafDescendants.get("a")).toEqual(["a1", "a2x"]);
    // c 下唯一叶 c1 是 disabled → 空
    expect(idx.leafDescendants.get("c")).toEqual([]);
    // 启用叶自身 leafDescendants = [自身]
    expect(idx.leafDescendants.get("a1")).toEqual(["a1"]);
  });
});

describe("flattenVisible", () => {
  it("只下钻展开枝，记录 depth/isLast", () => {
    const rows = flattenVisible(NODES, new Set(["a"]));
    expect(rows.map((r) => r.key)).toEqual(["a", "a1", "a2", "b", "c"]);
    const a = rows.find((r) => r.key === "a")!;
    expect(a.depth).toBe(0);
    expect(a.hasChildren).toBe(true);
    expect(a.expanded).toBe(true);
    const a2 = rows.find((r) => r.key === "a2")!;
    expect(a2.depth).toBe(1);
    expect(a2.isLast).toBe(true); // a 的子里 a2 是末项
    const c = rows.find((r) => r.key === "c")!;
    expect(c.isLast).toBe(true);
    expect(c.expanded).toBe(false); // 未在展开集
  });

  it("展开嵌套枝时继续下钻", () => {
    const rows = flattenVisible(NODES, new Set(["a", "a2"]));
    expect(rows.map((r) => r.key)).toEqual(["a", "a1", "a2", "a2x", "b", "c"]);
    const a2x = rows.find((r) => r.key === "a2x")!;
    expect(a2x.depth).toBe(2);
    expect(a2x.ancestorIsLast).toEqual([false, true]); // a 非末(后有b,c)、a2 末
  });
});

describe("getNodePath", () => {
  it("返回根到目标的节点链", () => {
    expect(getNodePath(NODES, "a2x").map((n) => n.key)).toEqual(["a", "a2", "a2x"]);
    expect(getNodePath(NODES, "b").map((n) => n.key)).toEqual(["b"]);
    expect(getNodePath(NODES, "nope")).toEqual([]);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @hulianui/ui test -- --run src/tree/tree-core.test.ts`
Expected: FAIL（模块/导出不存在）。

- [ ] **Step 3: 写实现**

`packages/ui/src/tree/tree-core.ts`：
```ts
import type { ReactNode } from "react";

/** 树节点数据。 */
export interface TreeNode {
  /** 唯一键；展开/选中/勾选态均以此标识。 */
  key: string;
  label: ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  icon?: ReactNode;
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
      childrenKeys.set(node.key, kids.map((k) => k.key));
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm --filter @hulianui/ui test -- --run src/tree/tree-core.test.ts`
Expected: PASS（8 测试）。

- [ ] **Step 5: 提交**

```bash
git add packages/ui/src/tree/tree-core.ts packages/ui/src/tree/tree-core.test.ts
git commit -m "feat(ui): 树引擎 Layer A 核（类型/buildIndex/flattenVisible/getNodePath）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: tree-core 勾选级联 + 搜索过滤

**Files:**
- Modify: `packages/ui/src/tree/tree-core.ts`（追加函数）
- Test: `packages/ui/src/tree/tree-core.test.ts`（追加 describe）

- [ ] **Step 1: 写失败测试**（追加到 `tree-core.test.ts` 末尾，并扩 import）

把首行 import 改为：
```ts
import {
  buildIndex,
  computeChecked,
  filterTree,
  flattenVisible,
  getCheckState,
  getNodePath,
  normalizeCheckedToLeaves,
  toggleChecked,
  type TreeNode,
} from "./tree-core";
```

追加：
```ts
describe("勾选级联（叶为真源）", () => {
  const idx = buildIndex(NODES);

  it("toggleChecked 勾选枝 → 全部启用叶后代入集", () => {
    const next = toggleChecked("a", true, new Set(), idx);
    expect([...next].sort()).toEqual(["a1", "a2x"]);
  });

  it("toggleChecked 取消枝 → 移出其叶后代", () => {
    const start = new Set(["a1", "a2x", "x"]);
    const next = toggleChecked("a", false, start, idx);
    expect([...next].sort()).toEqual(["x"]);
  });

  it("toggleChecked 叶 → 切自身", () => {
    expect([...toggleChecked("a1", true, new Set(), idx)]).toEqual(["a1"]);
    expect([...toggleChecked("a1", false, new Set(["a1"]), idx)]).toEqual([]);
  });

  it("getCheckState 三态", () => {
    expect(getCheckState("a", new Set(["a1", "a2x"]), idx)).toBe("checked");
    expect(getCheckState("a", new Set(["a1"]), idx)).toBe("indeterminate");
    expect(getCheckState("a", new Set(), idx)).toBe("unchecked");
    expect(getCheckState("a1", new Set(["a1"]), idx)).toBe("checked");
    // c 唯一叶 disabled → leafDescendants 空 → 永远 unchecked
    expect(getCheckState("c", new Set(), idx)).toBe("unchecked");
  });

  it("computeChecked 派生含全选枝 + 半选枝", () => {
    const r = computeChecked(new Set(["a1", "a2x"]), idx);
    expect(r.checkedKeys.sort()).toEqual(["a", "a1", "a2", "a2x"]);
    expect(r.halfCheckedKeys).toEqual([]);
    const half = computeChecked(new Set(["a1"]), idx);
    expect(half.checkedKeys.sort()).toEqual(["a1"]);
    expect(half.halfCheckedKeys).toEqual(["a"]);
  });

  it("normalizeCheckedToLeaves 展开枝 key 成叶集（round-trip 稳定）", () => {
    const leaves = normalizeCheckedToLeaves(["a"], idx);
    expect([...leaves].sort()).toEqual(["a1", "a2x"]);
    // emit 的 checkedKeys 再 ingest → 同一叶集
    const emitted = computeChecked(leaves, idx).checkedKeys;
    const round = normalizeCheckedToLeaves(emitted, idx);
    expect([...round].sort()).toEqual(["a1", "a2x"]);
  });
});

describe("filterTree", () => {
  it("命中 label + 祖先自动展开", () => {
    const { matchedKeys, autoExpandKeys } = filterTree(NODES, "a2x");
    expect(matchedKeys.has("a2x")).toBe(true);
    expect([...autoExpandKeys].sort()).toEqual(["a", "a2"]);
  });
  it("不区分大小写", () => {
    expect(filterTree(NODES, "a1").matchedKeys.has("a1")).toBe(true);
  });
  it("空 query 不过滤", () => {
    const r = filterTree(NODES, "");
    expect(r.matchedKeys.size).toBe(0);
    expect(r.autoExpandKeys.size).toBe(0);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @hulianui/ui test -- --run src/tree/tree-core.test.ts`
Expected: FAIL（新函数未导出）。

- [ ] **Step 3: 写实现**（追加到 `tree-core.ts` 末尾）

```ts
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

export function filterTree(
  nodes: TreeNode[],
  query: string,
): { matchedKeys: Set<string>; autoExpandKeys: Set<string> } {
  const matchedKeys = new Set<string>();
  const autoExpandKeys = new Set<string>();
  const q = query.trim().toLowerCase();
  if (!q) return { matchedKeys, autoExpandKeys };

  const labelText = (node: TreeNode): string =>
    typeof node.label === "string" || typeof node.label === "number"
      ? String(node.label).toLowerCase()
      : node.key.toLowerCase();

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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm --filter @hulianui/ui test -- --run src/tree/tree-core.test.ts`
Expected: PASS（全部，含新 10 测试）。

- [ ] **Step 5: 提交**

```bash
git add packages/ui/src/tree/tree-core.ts packages/ui/src/tree/tree-core.test.ts
git commit -m "feat(ui): 树引擎 Layer A 勾选级联（叶为真源/三态/round-trip）+ 搜索过滤

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: `<Tree>` 组件（Layer B）

**Files:**
- Create: `packages/ui/src/tree/tree.types.ts`
- Create: `packages/ui/src/tree/tree.tsx`
- Test: `packages/ui/src/tree/tree.test.tsx`

- [ ] **Step 1: 写类型**

`packages/ui/src/tree/tree.types.ts`：
```ts
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
```

- [ ] **Step 2: 写失败测试**

`packages/ui/src/tree/tree.test.tsx`：
```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tree } from "./tree";
import type { TreeNode } from "./tree-core";

const NODES: TreeNode[] = [
  {
    key: "a",
    label: "甲",
    children: [
      { key: "a1", label: "甲一" },
      { key: "a2", label: "甲二" },
    ],
  },
  { key: "b", label: "乙" },
];

describe("Tree", () => {
  it("渲染 treeitem + aria-level", () => {
    render(<Tree nodes={NODES} defaultExpandedKeys={["a"]} aria-label="t" />);
    const items = screen.getAllByRole("treeitem");
    expect(items.length).toBe(4); // 甲 甲一 甲二 乙
    const jiaYi = screen.getByText("甲一").closest('[role="treeitem"]')!;
    expect(jiaYi.getAttribute("aria-level")).toBe("2");
  });

  it("枝出 aria-expanded，点击切展开", () => {
    render(<Tree nodes={NODES} aria-label="t" />);
    const jia = screen.getByText("甲").closest('[role="treeitem"]')!;
    expect(jia.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("甲一")).toBeNull(); // 未展开不渲染子（收起）
    fireEvent.click(jia);
    expect(jia.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("甲一")).toBeTruthy();
  });

  it("roving tabindex：仅 active 行 0", () => {
    render(<Tree nodes={NODES} defaultExpandedKeys={["a"]} aria-label="t" />);
    const items = screen.getAllByRole("treeitem");
    const zero = items.filter((el) => el.getAttribute("tabindex") === "0");
    expect(zero.length).toBe(1);
  });

  it("→ 展开枝，← 收起枝（键盘）", () => {
    render(<Tree nodes={NODES} aria-label="t" />);
    const tree = screen.getByRole("tree");
    const jia = screen.getByText("甲").closest('[role="treeitem"]')!;
    fireEvent.focus(jia);
    fireEvent.keyDown(tree, { key: "ArrowRight" });
    expect(jia.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(tree, { key: "ArrowLeft" });
    expect(jia.getAttribute("aria-expanded")).toBe("false");
  });

  it("单选 onSelect", () => {
    const onSelect = vi.fn();
    render(<Tree nodes={NODES} onSelect={onSelect} aria-label="t" />);
    fireEvent.click(screen.getByText("乙").closest('[role="treeitem"]')!);
    expect(onSelect).toHaveBeenCalledWith(["b"], expect.objectContaining({ key: "b" }));
  });

  it("checkable：点父级联子 + 父变 checked", () => {
    const onCheck = vi.fn();
    render(<Tree nodes={NODES} checkable defaultExpandedKeys={["a"]} onCheck={onCheck} aria-label="t" />);
    // 第一个 checkbox = 甲
    const boxes = screen.getAllByRole("checkbox");
    fireEvent.click(boxes[0]);
    expect(onCheck).toHaveBeenCalled();
    const info = onCheck.mock.calls.at(-1)![0];
    expect(info.checkedKeys.sort()).toEqual(["a", "a1", "a2"]);
  });

  it("checkable：点一个子 → 父 indeterminate（aria-checked mixed）", () => {
    render(<Tree nodes={NODES} checkable defaultExpandedKeys={["a"]} aria-label="t" />);
    const boxes = screen.getAllByRole("checkbox");
    // boxes: [甲, 甲一, 甲二, 乙]
    fireEvent.click(boxes[1]); // 甲一
    expect(boxes[0].getAttribute("aria-checked")).toBe("mixed");
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

Run: `pnpm --filter @hulianui/ui test -- --run src/tree/tree.test.tsx`
Expected: FAIL（`./tree` 不存在）。

- [ ] **Step 4a: 给瑚琏 Checkbox 加 tabIndex 透传（additive）**

`CheckboxProps` 是白名单签名，不含 `tabIndex`。Tree 需把行内 Checkbox `tabIndex={-1}` 以保 roving 纯净。在 `packages/ui/src/checkbox/checkbox.types.ts` 的 `CheckboxProps` 内加一行（`onCheckedChange` 已存在，用它做切换；`onClick` 不需要）：
```ts
  /** 透传到 Checkbox.Root（树等场景置 -1 退出 Tab 序，焦点由容器 roving 接管）。 */
  tabIndex?: number;
```
`checkbox.tsx` 的 `{...props}` 已运行时透传，无需改实现。

- [ ] **Step 4: 写实现**

`packages/ui/src/tree/tree.tsx`（完整）：
```tsx
"use client";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useReducedMotion } from "motion/react";
import { Search } from "lucide-react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { Checkbox } from "../checkbox";
import {
  buildIndex,
  computeChecked,
  filterTree,
  flattenVisible,
  getCheckState,
  getNodePath,
  normalizeCheckedToLeaves,
  toggleChecked,
  type FlatRow,
  type TreeNode,
} from "./tree-core";
import type { TreeProps } from "./tree.types";

// 自研递归树（WAI-ARIA tree pattern · 零依赖）：roving tabindex + 方向键/Home/End/typeahead +
// 展开 grid-rows 过渡 + 可选 checkable 父子级联 + 连接线 + 搜索。复用 nav-menu/listbox 范式肌肉，不重构它们。
export function Tree({
  nodes,
  expandedKeys,
  defaultExpandedKeys = [],
  onExpandedChange,
  selectable = true,
  selectedKeys,
  defaultSelectedKeys = [],
  onSelect,
  checkable = false,
  checkedKeys,
  defaultCheckedKeys = [],
  onCheck,
  showLine = false,
  searchable = false,
  searchPlaceholder = "搜索",
  className,
  "aria-label": ariaLabel = "树",
}: TreeProps) {
  const reduced = useReducedMotion();
  const index = useMemo(() => buildIndex(nodes), [nodes]);

  // —— 展开态（受控/非受控）——
  const [expandedState, setExpandedState] = useState<string[]>(defaultExpandedKeys);
  const expanded = expandedKeys ?? expandedState;
  const setExpanded = (next: string[]) => {
    if (expandedKeys === undefined) setExpandedState(next);
    onExpandedChange?.(next);
  };
  const toggleExpand = (key: string, next: boolean) => {
    const set = new Set(expanded);
    if (next) set.add(key);
    else set.delete(key);
    setExpanded([...set]);
  };

  // —— 选中态（受控/非受控）——
  const [selectedState, setSelectedState] = useState<string[]>(defaultSelectedKeys);
  const selected = selectedKeys ?? selectedState;
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const setSelected = (key: string) => {
    if (selectedKeys === undefined) setSelectedState([key]);
    const node = index.nodeMap.get(key);
    if (node) onSelect?.([key], node);
  };

  // —— 勾选态（叶为真源；受控入参归一为叶集）——
  const [checkedState, setCheckedState] = useState<string[]>(defaultCheckedKeys);
  const checkedInput = checkedKeys ?? checkedState;
  const leafSet = useMemo(() => normalizeCheckedToLeaves(checkedInput, index), [checkedInput, index]);
  const applyCheck = (key: string, nextLeaf: Set<string>) => {
    const payload = computeChecked(nextLeaf, index);
    if (checkedKeys === undefined) setCheckedState(payload.checkedKeys);
    const node = index.nodeMap.get(key);
    if (node) onCheck?.(payload, node);
  };
  const onToggleCheck = (key: string) => {
    const state = getCheckState(key, leafSet, index);
    const next = toggleChecked(key, state !== "checked", leafSet, index);
    applyCheck(key, next);
  };

  // —— 搜索（内部态）——
  const [query, setQuery] = useState("");
  const { matchedKeys, autoExpandKeys } = useMemo(() => filterTree(nodes, query), [nodes, query]);
  const searching = searchable && query.trim().length > 0;

  // 搜索时：展开集 = 自动展开命中路径；可见性按命中路径过滤。
  const effExpanded = searching ? autoExpandKeys : new Set(expanded);
  const allFlat = useMemo(() => flattenVisible(nodes, effExpanded), [nodes, effExpanded]);
  const flat = useMemo(() => {
    if (!searching) return allFlat;
    // 只保留命中节点或命中节点祖先的行
    return allFlat.filter((r) => matchedKeys.has(r.key) || autoExpandKeys.has(r.key));
  }, [allFlat, searching, matchedKeys, autoExpandKeys]);

  // —— roving tabindex ——
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const flatKeys = flat.map((r) => r.key);
  const firstSelected = flat.find((r) => selectedSet.has(r.key))?.key;
  const effectiveActive =
    activeKey && flatKeys.includes(activeKey) ? activeKey : (firstSelected ?? flatKeys[0] ?? null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const focusKey = (key: string) => {
    setActiveKey(key);
    itemRefs.current.get(key)?.focus();
  };

  const activate = (row: FlatRow) => {
    if (row.disabled) return;
    if (row.hasChildren) {
      toggleExpand(row.key, !row.expanded);
    } else if (checkable) {
      onToggleCheck(row.key);
    } else if (selectable) {
      setSelected(row.key);
    }
  };

  const typeahead = (char: string, from: number) => {
    const c = char.toLowerCase();
    const text = (r: FlatRow) => (typeof r.node.label === "string" ? r.node.label : r.key).toLowerCase();
    for (let n = 1; n <= flat.length; n++) {
      const i = (from + n) % flat.length;
      if (!flat[i].disabled && text(flat[i]).startsWith(c)) return i;
    }
    return -1;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const idx = flat.findIndex((r) => r.key === effectiveActive);
    if (idx === -1) return;
    const row = flat[idx];
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (flat[idx + 1]) focusKey(flat[idx + 1].key);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (flat[idx - 1]) focusKey(flat[idx - 1].key);
        break;
      }
      case "ArrowRight": {
        e.preventDefault();
        if (row.hasChildren && !row.expanded) toggleExpand(row.key, true);
        else if (row.expanded) {
          const child = flat[idx + 1];
          if (child && child.parentKey === row.key) focusKey(child.key);
        }
        break;
      }
      case "ArrowLeft": {
        e.preventDefault();
        if (row.hasChildren && row.expanded) toggleExpand(row.key, false);
        else if (row.parentKey) focusKey(row.parentKey);
        break;
      }
      case "Home": {
        e.preventDefault();
        if (flat[0]) focusKey(flat[0].key);
        break;
      }
      case "End": {
        e.preventDefault();
        if (flat.at(-1)) focusKey(flat.at(-1)!.key);
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        activate(row);
        break;
      }
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          const i = typeahead(e.key, idx);
          if (i >= 0) focusKey(flat[i].key);
        }
    }
  };

  // 递归渲染（展开过渡用 grid-rows）。搜索态直接平铺 flat（不走过渡，避免过滤抖动）。
  const renderTree = (list: TreeNode[], depth: number, ancestorIsLast: boolean[]) =>
    list.map((node, i) => {
      const isLast = i === list.length - 1;
      const hasChildren = !!node.children?.length;
      const isExpanded = hasChildren && effExpanded.has(node.key);
      const isSelected = selectedSet.has(node.key);
      const checkState = checkable ? getCheckState(node.key, leafSet, index) : "unchecked";
      const isActive = node.key === effectiveActive;
      const setRef = (el: HTMLElement | null) => {
        if (el) itemRefs.current.set(node.key, el);
        else itemRefs.current.delete(node.key);
      };

      return (
        <li key={node.key} role="none">
          <div
            role="treeitem"
            ref={setRef}
            aria-level={depth + 1}
            aria-setsize={list.length}
            aria-posinset={i + 1}
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={!checkable && isSelected ? true : undefined}
            aria-checked={checkable ? (checkState === "indeterminate" ? "mixed" : checkState === "checked") : undefined}
            aria-disabled={node.disabled || undefined}
            tabIndex={isActive && !node.disabled ? 0 : -1}
            onFocus={() => setActiveKey(node.key)}
            onClick={() => {
              if (node.disabled) return;
              setActiveKey(node.key);
              if (hasChildren) toggleExpand(node.key, !isExpanded);
              else if (checkable) onToggleCheck(node.key);
              else if (selectable) setSelected(node.key);
            }}
            style={{ paddingLeft: `calc(0.5rem + ${depth} * 1.25rem)` }}
            className={cn(
              "group/row relative flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm outline-none transition-colors",
              "text-foreground hover:bg-surface-hover",
              "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              !checkable && "data-[selected]:bg-primary/12 data-[selected]:text-primary data-[selected]:font-medium",
              "aria-disabled:pointer-events-none aria-disabled:opacity-50",
              showLine && "tree-line",
            )}
            data-selected={!checkable && isSelected ? "" : undefined}
          >
            {/* chevron 展开器 */}
            <span className="flex size-4 shrink-0 items-center justify-center text-muted">
              {hasChildren ? (
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn("size-3.5 transition-transform", isExpanded && "rotate-90")}
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              ) : null}
            </span>
            {checkable ? (
              <span onClick={(e) => e.stopPropagation()} className="flex shrink-0">
                <Checkbox
                  checked={checkState === "checked"}
                  indeterminate={checkState === "indeterminate"}
                  disabled={node.disabled}
                  tabIndex={-1}
                  onCheckedChange={() => onToggleCheck(node.key)}
                />
              </span>
            ) : null}
            {node.icon ? (
              <span aria-hidden className="shrink-0 text-muted [&>svg]:size-4">
                {node.icon}
              </span>
            ) : null}
            <span className="truncate">{node.label}</span>
          </div>

          {hasChildren && !searching ? (
            <div
              className={cn("grid transition-[grid-template-rows]", isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}
              style={{
                transitionDuration: reduced ? "0ms" : motionDurationCss.base,
                transitionTimingFunction: motionEaseCss.out,
              }}
            >
              <div className="min-h-0 overflow-hidden">
                <ul role="group" className="flex flex-col">
                  {renderTree(node.children!, depth + 1, [...ancestorIsLast, isLast])}
                </ul>
              </div>
            </div>
          ) : null}
        </li>
      );
    });

  // 搜索态：平铺渲染过滤后的 flat 行（含命中高亮，不走嵌套过渡）。
  const renderFlatSearch = () =>
    flat.map((row) => {
      const node = row.node;
      const hasChildren = row.hasChildren;
      const checkState = checkable ? getCheckState(node.key, leafSet, index) : "unchecked";
      const isActive = node.key === effectiveActive;
      return (
        <li key={node.key} role="none">
          <div
            role="treeitem"
            ref={(el) => {
              if (el) itemRefs.current.set(node.key, el);
              else itemRefs.current.delete(node.key);
            }}
            aria-level={row.depth + 1}
            aria-expanded={hasChildren ? row.expanded : undefined}
            aria-checked={checkable ? (checkState === "indeterminate" ? "mixed" : checkState === "checked") : undefined}
            aria-disabled={node.disabled || undefined}
            tabIndex={isActive && !node.disabled ? 0 : -1}
            onFocus={() => setActiveKey(node.key)}
            onClick={() => {
              if (node.disabled) return;
              setActiveKey(node.key);
              if (hasChildren) toggleExpand(node.key, !row.expanded);
              else if (checkable) onToggleCheck(node.key);
              else if (selectable) setSelected(node.key);
            }}
            style={{ paddingLeft: `calc(0.5rem + ${row.depth} * 1.25rem)` }}
            className={cn(
              "flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-sm outline-none transition-colors",
              "text-foreground hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
              matchedKeys.has(node.key) && "font-medium text-primary",
              "aria-disabled:pointer-events-none aria-disabled:opacity-50",
            )}
          >
            <span className="size-4 shrink-0" aria-hidden />
            {checkable ? (
              <span onClick={(e) => e.stopPropagation()} className="flex shrink-0">
                <Checkbox
                  checked={checkState === "checked"}
                  indeterminate={checkState === "indeterminate"}
                  disabled={node.disabled}
                  tabIndex={-1}
                  onCheckedChange={() => onToggleCheck(node.key)}
                />
              </span>
            ) : null}
            <span className="truncate">{node.label}</span>
          </div>
        </li>
      );
    });

  return (
    <div className={cn("w-full select-none text-foreground", className)}>
      {searchable ? (
        <div className="mb-2 flex h-9 items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-2.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-bg">
          <Search className="size-4 shrink-0 text-muted" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
            aria-label={searchPlaceholder}
          />
        </div>
      ) : null}
      <ul role="tree" aria-label={ariaLabel} aria-multiselectable={checkable || undefined} onKeyDown={onKeyDown} className="flex flex-col">
        {searching ? renderFlatSearch() : renderTree(nodes, 0, [])}
      </ul>
      {searching && flat.length === 0 ? (
        <div className="px-2 py-6 text-center text-sm text-muted">无匹配项</div>
      ) : null}
    </div>
  );

  // 静默引用，避免 getNodePath 在本文件未用触发 lint（TreeSelect/Cascader 用；保留导出即可，无需此行）。
}
```

> 注意：`getNodePath` 在 `tree.tsx` 不使用（仅 TreeSelect/Cascader 用），import 里**不要**引入它，避免 unused。上面 import 已含 `getNodePath`——执行时从 `tree.tsx` 的 import 删除 `getNodePath` 与 `FlatRow` 若未用。实际 `FlatRow` 用于 `activate(row)` 与 `typeahead` 形参类型，保留；`getNodePath` 删除。

- [ ] **Step 5: 跑测试确认通过**

Run: `pnpm --filter @hulianui/ui test -- --run src/tree/tree.test.tsx`
Expected: PASS（7 测试）。

- [ ] **Step 6: typecheck（ui 包）**

Run: `pnpm --filter @hulianui/ui exec tsc --noEmit`
Expected: 无错误（若报 `getNodePath`/`FlatRow` unused → 按 Step4 注释删除）。

- [ ] **Step 7: 提交**

```bash
git add packages/ui/src/tree/tree.tsx packages/ui/src/tree/tree.types.ts packages/ui/src/tree/tree.test.tsx packages/ui/src/checkbox/checkbox.types.ts
git commit -m "feat(ui): Tree 组件（Layer B · roving/键盘/grid-rows 过渡/checkable 级联/连接线/搜索）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Tree 五件套收尾 + 连接线 CSS + 接入 IA

**Files:**
- Create: `packages/ui/src/tree/tree.showcase.tsx`
- Create: `packages/ui/src/tree/index.ts`
- Modify: `packages/ui/src/index.ts`（加 export）
- Modify: `apps/www/app/globals.css`（连接线 `.tree-line` 样式）
- Modify: `apps/www/lib/manifest.ts`（1 行）
- Modify: `apps/www/lib/registry.tsx`（import + map）

- [ ] **Step 1: 写 showcase**

`packages/ui/src/tree/tree.showcase.tsx`：
```tsx
"use client";
import { Folder } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Tree } from "./tree";
import type { TreeNode } from "./tree-core";

const NODES: TreeNode[] = [
  {
    key: "design",
    label: "设计",
    icon: <Folder />,
    children: [
      { key: "tokens", label: "Tokens" },
      { key: "theme", label: "主题" },
      { key: "motion", label: "动效", disabled: true },
    ],
  },
  {
    key: "components",
    label: "组件",
    icon: <Folder />,
    children: [
      { key: "form", label: "表单", children: [{ key: "input", label: "Input" }, { key: "select", label: "Select" }] },
      { key: "feedback", label: "反馈", children: [{ key: "alert", label: "Alert" }, { key: "toast", label: "Toast" }] },
    ],
  },
  { key: "docs", label: "文档" },
];

function Box({ children }: { children: React.ReactNode }) {
  return <div className="w-72 rounded-[var(--radius)] border border-border bg-surface p-2">{children}</div>;
}

export const treeShowcase: ShowcaseSpec = {
  controls: [
    { prop: "checkable", type: "boolean", defaultValue: false, label: "checkable（复选）" },
    { prop: "showLine", type: "boolean", defaultValue: false, label: "showLine（连接线）" },
    { prop: "searchable", type: "boolean", defaultValue: false, label: "searchable（搜索）" },
  ],
  states: [
    { name: "默认（单选 · 展开两枝）", render: () => (<Box><Tree nodes={NODES} defaultExpandedKeys={["design", "components"]} defaultSelectedKeys={["theme"]} /></Box>) },
    { name: "checkable（父子级联半选）", render: () => (<Box><Tree nodes={NODES} checkable defaultExpandedKeys={["design", "components", "form"]} defaultCheckedKeys={["tokens"]} /></Box>) },
    { name: "showLine（连接线）", render: () => (<Box><Tree nodes={NODES} showLine defaultExpandedKeys={["components", "form"]} /></Box>) },
    { name: "searchable（树内搜索）", render: () => (<Box><Tree nodes={NODES} searchable searchPlaceholder="搜索组件" /></Box>) },
  ],
  renderWithProps: (p) => (
    <Box>
      <Tree
        nodes={NODES}
        defaultExpandedKeys={["design", "components"]}
        defaultSelectedKeys={["theme"]}
        checkable={p.checkable as boolean}
        showLine={p.showLine as boolean}
        searchable={p.searchable as boolean}
      />
    </Box>
  ),
  toCode: (p) =>
    `<Tree\n  nodes={nodes}\n  defaultExpandedKeys={["design", "components"]}${p.checkable ? "\n  checkable" : ""}${p.showLine ? "\n  showLine" : ""}${p.searchable ? "\n  searchable" : ""}\n/>`,
};
```

- [ ] **Step 2: 写桶导出**

`packages/ui/src/tree/index.ts`：
```ts
export { Tree } from "./tree";
export type { TreeProps, TreeNode } from "./tree.types";
export { treeShowcase } from "./tree.showcase";
// Layer A 核：供 tree-select / cascader 复用，并对外暴露工具类型
export {
  buildIndex,
  flattenVisible,
  getNodePath,
  toggleChecked,
  getCheckState,
  normalizeCheckedToLeaves,
  computeChecked,
  filterTree,
  type FlatRow,
  type TreeIndex,
  type CheckState,
} from "./tree-core";
```

- [ ] **Step 3: 主桶 export**

在 `packages/ui/src/index.ts` 找到 nav-menu 或同 navigation 导出附近，追加一行（用幂等读改写，先 grep 确认未存在）：
```ts
export * from "./tree";
```
Run 检查：`grep -n 'from "./tree"' packages/ui/src/index.ts`（应仅 1 处，且非 `./tree-select`/`./treemap` 误配）。

- [ ] **Step 4: 连接线 CSS**

在 `apps/www/app/globals.css` 末尾追加（先 grep `tree-line` 确认未存在）：
```css
/* Tree showLine：缩进连接线。treeitem 左侧按 padding 画竖线 + 当前项横线。 */
.tree-line::before {
  content: "";
  position: absolute;
  left: 0.95rem;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--color-border);
}
.tree-line::after {
  content: "";
  position: absolute;
  left: 0.95rem;
  top: 50%;
  width: 0.5rem;
  height: 1px;
  background: var(--color-border);
}
```
> 注：连接线为「锦上添花」视觉，精确几何以截图为准（Task 7）。若 `--color-border` 变量名不符，grep `globals.css`/`semantic.css` 实际 border 变量名替换。

- [ ] **Step 5: manifest 一行**（幂等 python 读改写，缩竞争窗口）

在 `apps/www/lib/manifest.ts` 的组件数组末项（`date-range-picker` 行）后插入：
```ts
  { slug: "tree", name: "Tree", description: "递归树 · 自研零依赖引擎 + WAI-ARIA tree(roving/方向键/typeahead) + checkable 父子级联半选 + 连接线 + 树内搜索 + grid-rows 高度过渡", category: "data-display", status: "new" },
```
用命令（避免与并行 session 撞车）：
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
grep -q 'slug: "tree"' apps/www/lib/manifest.ts || python3 - <<'PY'
import re, io
p = "apps/www/lib/manifest.ts"
s = open(p, encoding="utf-8").read()
line = '  { slug: "tree", name: "Tree", description: "递归树 · 自研零依赖引擎 + WAI-ARIA tree(roving/方向键/typeahead) + checkable 父子级联半选 + 连接线 + 树内搜索 + grid-rows 高度过渡", category: "data-display", status: "new" },\n'
anchor = 'slug: "date-range-picker"'
i = s.index(anchor)
eol = s.index("\n", i) + 1
s = s[:eol] + line + s[eol:]
open(p, "w", encoding="utf-8").write(s)
print("inserted tree")
PY
```

- [ ] **Step 6: registry import + map**（同幂等思路）

`apps/www/lib/registry.tsx`：import 段加 `treeShowcase`，map 段加 `"tree": treeShowcase`。
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
grep -q 'treeShowcase' apps/www/lib/registry.tsx || python3 - <<'PY'
p = "apps/www/lib/registry.tsx"
s = open(p, encoding="utf-8").read()
# 1) import：在 "} from \"@hulianui/ui\";" 前插一行（找第一处 import 列表）
imp = "  treeShowcase,\n"
i = s.index("navMenuShowcase,")
eol = s.index("\n", i) + 1
s = s[:eol] + imp + s[eol:]
# 2) map：在 '"nav-menu": navMenuShowcase,' 后插
m = '  "tree": treeShowcase,\n'
j = s.index('"nav-menu": navMenuShowcase,')
eol2 = s.index("\n", j) + 1
s = s[:eol2] + m + s[eol2:]
open(p, "w", encoding="utf-8").write(s)
print("wired tree")
PY
```
> 若 `navMenuShowcase,` 在 import 与 map 两处都匹配，python `index` 取首处（import 段）——故先插 import 安全；map 锚点用带引号的 `"nav-menu": navMenuShowcase,` 唯一。

- [ ] **Step 7: 验证契约测试 + 构建**

Run: `pnpm --filter @hulianui/ui test -- --run && pnpm --filter @hulianui/www build`
Expected: ui 测试全绿；www SSG 含 `/components/tree`。
> 若 www build 因并行 session 占共享 `.next` 锁失败，用 skill `nextjs-build-verify-isolated-distdir-when-shared-next-lock-contended` 隔离 distDir。

- [ ] **Step 8: 提交**（精确 pathspec）

```bash
git add packages/ui/src/tree/tree.showcase.tsx packages/ui/src/tree/index.ts packages/ui/src/index.ts apps/www/app/globals.css apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(ui): Tree 五件套收尾 + 连接线 CSS + 接入 IA(data-display)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: TreeSelect

**Files:**
- Create: `packages/ui/src/tree-select/tree-select.types.ts`
- Create: `packages/ui/src/tree-select/tree-select.tsx`
- Create: `packages/ui/src/tree-select/tree-select.test.tsx`
- Create: `packages/ui/src/tree-select/tree-select.showcase.tsx`
- Create: `packages/ui/src/tree-select/index.ts`
- Modify: `packages/ui/src/index.ts`、`apps/www/lib/manifest.ts`、`apps/www/lib/registry.tsx`

- [ ] **Step 1: 类型**

`tree-select.types.ts`：
```ts
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
  searchable?: boolean;
  showLine?: boolean;
  className?: string;
}
```

- [ ] **Step 2: 写失败测试**

`tree-select.test.tsx`：
```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TreeSelect } from "./tree-select";
import type { TreeNode } from "../tree/tree-core";

const NODES: TreeNode[] = [
  { key: "a", label: "甲", children: [{ key: "a1", label: "甲一" }] },
  { key: "b", label: "乙" },
];

describe("TreeSelect", () => {
  it("点 Trigger 开浮层，显示 placeholder", () => {
    render(<TreeSelect nodes={NODES} placeholder="请选择" />);
    expect(screen.getByText("请选择")).toBeTruthy();
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByRole("tree")).toBeTruthy();
  });

  it("单选叶子 → onChange(key) + Trigger 显示 label", () => {
    const onChange = vi.fn();
    render(<TreeSelect nodes={NODES} onChange={onChange} placeholder="请选择" />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("乙").closest('[role="treeitem"]')!);
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("多选 → checkable 树，value 为数组", () => {
    const onChange = vi.fn();
    render(<TreeSelect nodes={NODES} multiple onChange={onChange} placeholder="请选择" />);
    fireEvent.click(screen.getByRole("button"));
    const boxes = screen.getAllByRole("checkbox");
    fireEvent.click(boxes.at(-1)!); // 乙
    expect(onChange).toHaveBeenCalledWith(expect.arrayContaining(["b"]));
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

Run: `pnpm --filter @hulianui/ui test -- --run src/tree-select/tree-select.test.tsx`
Expected: FAIL。

- [ ] **Step 4: 写实现**

`tree-select.tsx`（完整）：
```tsx
"use client";
import { useMemo, useState } from "react";
import { Popover as BasePopover } from "@base-ui-components/react/popover";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { Tree } from "../tree/tree";
import { buildIndex } from "../tree/tree-core";
import type { TreeSelectProps } from "./tree-select.types";

const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

const triggerVariants = cva(
  [
    "inline-flex w-full items-center justify-between gap-2 rounded-[var(--radius)] border border-border bg-surface text-foreground transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "data-[popup-open]:border-ring",
    "data-[invalid]:border-danger data-[invalid]:focus-visible:ring-danger",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: { sm: "h-8 px-2.5 text-sm", md: "h-10 px-3 text-sm", lg: "h-12 px-3.5 text-base" },
    },
    defaultVariants: { size: "md" },
  },
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function TreeSelect({
  nodes,
  value,
  defaultValue,
  onChange,
  multiple = false,
  placeholder = "请选择",
  disabled,
  invalid,
  size = "md",
  searchable = false,
  showLine = false,
  className,
}: TreeSelectProps) {
  const index = useMemo(() => buildIndex(nodes), [nodes]);
  const [open, setOpen] = useState(false);

  const [internal, setInternal] = useState<string | string[]>(
    defaultValue ?? (multiple ? [] : ""),
  );
  const current = value ?? internal;
  const setValue = (next: string | string[]) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  // Trigger 标签
  const labelOf = (key: string) => index.nodeMap.get(key)?.label ?? key;
  const selectedArr = multiple ? (current as string[]) : current ? [current as string] : [];
  const hasValue = selectedArr.length > 0;

  return (
    <BasePopover.Root open={open} onOpenChange={setOpen}>
      <BasePopover.Trigger
        disabled={disabled}
        {...(invalid && { "data-invalid": "", "aria-invalid": true })}
        className={cn(triggerVariants({ size }), className)}
      >
        <span className={cn("flex min-w-0 flex-1 flex-wrap items-center gap-1 truncate text-left", !hasValue && "text-muted")}>
          {!hasValue
            ? placeholder
            : multiple
              ? selectedArr.map((k) => (
                  <span key={k} className="inline-flex items-center rounded bg-surface-hover px-1.5 py-0.5 text-xs text-foreground">
                    {labelOf(k)}
                  </span>
                ))
              : labelOf(selectedArr[0])}
        </span>
        <span className="flex shrink-0 text-muted transition-transform data-[popup-open]:rotate-180">
          <ChevronDownIcon />
        </span>
      </BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner side="bottom" align="start" sideOffset={6} className="z-50">
          <BasePopover.Popup
            className={cn(
              "max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto rounded-[var(--radius)] border border-border bg-surface p-2 text-foreground shadow-xl outline-none",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            )}
            style={overlayTransition}
          >
            {multiple ? (
              <Tree
                nodes={nodes}
                checkable
                searchable={searchable}
                showLine={showLine}
                checkedKeys={current as string[]}
                onCheck={(info) => setValue(info.checkedKeys.filter((k) => (index.childrenKeys.get(k) ?? []).length === 0))}
              />
            ) : (
              <Tree
                nodes={nodes}
                searchable={searchable}
                showLine={showLine}
                selectedKeys={current ? [current as string] : []}
                onSelect={(keys) => {
                  setValue(keys[0]);
                  setOpen(false);
                }}
              />
            )}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
```
> 多选 value 取「叶 key」（`onCheck` 过滤掉枝 key），与受控 `checkedKeys` 经 Tree 的 normalize 双向稳定。单选选任意节点（含枝）后收起。

- [ ] **Step 5: 跑测试确认通过**

Run: `pnpm --filter @hulianui/ui test -- --run src/tree-select/tree-select.test.tsx`
Expected: PASS（3 测试）。

- [ ] **Step 6: showcase + index + 接线**

`tree-select.showcase.tsx`：
```tsx
"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { TreeSelect } from "./tree-select";
import type { TreeNode } from "../tree/tree-core";

const NODES: TreeNode[] = [
  { key: "zhejiang", label: "浙江", children: [
    { key: "hangzhou", label: "杭州", children: [{ key: "xihu", label: "西湖区" }, { key: "yuhang", label: "余杭区" }] },
    { key: "ningbo", label: "宁波" },
  ] },
  { key: "jiangsu", label: "江苏", children: [{ key: "nanjing", label: "南京" }, { key: "suzhou", label: "苏州" }] },
];

function Single() {
  const [v, setV] = useState<string | string[]>("");
  return <div className="w-72"><TreeSelect nodes={NODES} value={v} onChange={setV} placeholder="选择地区" searchable /></div>;
}
function Multi() {
  const [v, setV] = useState<string | string[]>([]);
  return <div className="w-72"><TreeSelect nodes={NODES} multiple value={v} onChange={setV} placeholder="多选地区" /></div>;
}

export const treeSelectShowcase: ShowcaseSpec = {
  controls: [
    { prop: "multiple", type: "boolean", defaultValue: false, label: "multiple（多选）" },
    { prop: "searchable", type: "boolean", defaultValue: true, label: "searchable" },
  ],
  states: [
    { name: "单选 + 搜索", render: () => <Single /> },
    { name: "多选（checkable 父子级联）", render: () => <Multi /> },
  ],
  renderWithProps: (p) => {
    const Demo = (p.multiple as boolean) ? Multi : Single;
    return <Demo />;
  },
  toCode: (p) =>
    `<TreeSelect\n  nodes={nodes}${p.multiple ? "\n  multiple" : ""}${p.searchable ? "\n  searchable" : ""}\n  value={value}\n  onChange={setValue}\n/>`,
};
```

`index.ts`：
```ts
export { TreeSelect } from "./tree-select";
export type { TreeSelectProps } from "./tree-select.types";
export { treeSelectShowcase } from "./tree-select.showcase";
```

主桶 `packages/ui/src/index.ts` 加 `export * from "./tree-select";`（grep 确认未存在）。

manifest 行（在 `slug: "tree"` 后插，幂等）：
```ts
  { slug: "tree-select", name: "TreeSelect", description: "树选择器 · 触发器 + Popover 浮层内嵌 Tree + 单选/多选(checkable)对称 + 树内搜索 · 复用树引擎核", category: "inputs", status: "new" },
```
registry：import `treeSelectShowcase` + map `"tree-select": treeSelectShowcase`（锚点 `"tree": treeShowcase,`）。

- [ ] **Step 7: 测试 + 构建 + 提交**

```bash
pnpm --filter @hulianui/ui test -- --run && pnpm --filter @hulianui/www build
git add packages/ui/src/tree-select/ packages/ui/src/index.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(ui): TreeSelect（Popover 浮层 + 内嵌 Tree · 单选/多选 checkable · 复用树引擎核）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Cascader

**Files:**
- Create: `packages/ui/src/cascader/cascader.types.ts`
- Create: `packages/ui/src/cascader/cascader.tsx`
- Create: `packages/ui/src/cascader/cascader.test.tsx`
- Create: `packages/ui/src/cascader/cascader.showcase.tsx`
- Create: `packages/ui/src/cascader/index.ts`
- Modify: `packages/ui/src/index.ts`、`apps/www/lib/manifest.ts`、`apps/www/lib/registry.tsx`

- [ ] **Step 1: 类型**

`cascader.types.ts`：
```ts
import type { TreeNode } from "../tree/tree-core";

export interface CascaderProps {
  nodes: TreeNode[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (path: string[], nodes: TreeNode[]) => void;
  expandTrigger?: "click" | "hover";
  changeOnSelect?: boolean;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

- [ ] **Step 2: 写失败测试**

`cascader.test.tsx`：
```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Cascader } from "./cascader";
import type { TreeNode } from "../tree/tree-core";

const NODES: TreeNode[] = [
  { key: "zj", label: "浙江", children: [
    { key: "hz", label: "杭州", children: [{ key: "xh", label: "西湖区" }] },
  ] },
  { key: "js", label: "江苏", children: [{ key: "nj", label: "南京" }] },
];

describe("Cascader", () => {
  it("点 Trigger 开浮层显示首列", () => {
    render(<Cascader nodes={NODES} placeholder="选择" />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("浙江")).toBeTruthy();
    expect(screen.getByText("江苏")).toBeTruthy();
  });

  it("逐级下钻 + 叶子提交路径", () => {
    const onChange = vi.fn();
    render(<Cascader nodes={NODES} onChange={onChange} placeholder="选择" />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByText("浙江"));
    expect(screen.getByText("杭州")).toBeTruthy(); // 第二列出现
    fireEvent.click(screen.getByText("杭州"));
    fireEvent.click(screen.getByText("西湖区"));
    expect(onChange).toHaveBeenCalledWith(["zj", "hz", "xh"], expect.any(Array));
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

Run: `pnpm --filter @hulianui/ui test -- --run src/cascader/cascader.test.tsx`
Expected: FAIL。

- [ ] **Step 4: 写实现**

`cascader.tsx`（完整）：
```tsx
"use client";
import { useMemo, useState } from "react";
import { Popover as BasePopover } from "@base-ui-components/react/popover";
import { cva } from "class-variance-authority";
import { ChevronRight } from "lucide-react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { getNodePath, type TreeNode } from "../tree/tree-core";
import type { CascaderProps } from "./cascader.types";

const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

const triggerVariants = cva(
  [
    "inline-flex w-full items-center justify-between gap-2 rounded-[var(--radius)] border border-border bg-surface text-foreground transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "data-[popup-open]:border-ring",
    "data-[invalid]:border-danger data-[invalid]:focus-visible:ring-danger",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  { variants: { size: { sm: "h-8 px-2.5 text-sm", md: "h-10 px-3 text-sm", lg: "h-12 px-3.5 text-base" } }, defaultVariants: { size: "md" } },
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 从 nodes 沿 activePath 取每一列要显示的 list（列 0 = 根，列 n = activePath[n-1] 的子）。
function columnsOf(nodes: TreeNode[], activePath: string[]): TreeNode[][] {
  const cols: TreeNode[][] = [nodes];
  let list = nodes;
  for (const key of activePath) {
    const node = list.find((n) => n.key === key);
    if (!node?.children?.length) break;
    cols.push(node.children);
    list = node.children;
  }
  return cols;
}

export function Cascader({
  nodes,
  value,
  defaultValue = [],
  onChange,
  expandTrigger = "click",
  changeOnSelect = false,
  placeholder = "请选择",
  disabled,
  invalid,
  size = "md",
  className,
}: CascaderProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState<string[]>(defaultValue);
  const current = value ?? internal;

  // 浮层内的「正在浏览」路径（区别于已提交 value）；打开时以 value 初始化。
  const [activePath, setActivePath] = useState<string[]>(current);

  const cols = useMemo(() => columnsOf(nodes, activePath), [nodes, activePath]);
  const triggerLabel = useMemo(() => {
    if (!current.length) return null;
    const path = getNodePath(nodes, current.at(-1)!);
    return path.map((n) => n.label).reduce<React.ReactNode[]>((acc, l, i) => (i ? [...acc, " / ", l] : [l]), []);
  }, [nodes, current]);

  const commit = (path: string[]) => {
    const nodePath = path.map((k) => getNodePath(nodes, k).at(-1)!).filter(Boolean);
    if (value === undefined) setInternal(path);
    onChange?.(path, nodePath);
  };

  const onPick = (colIndex: number, node: TreeNode) => {
    if (node.disabled) return;
    const nextPath = [...activePath.slice(0, colIndex), node.key];
    setActivePath(nextPath);
    const hasChildren = !!node.children?.length;
    if (!hasChildren) {
      commit(nextPath);
      setOpen(false);
    } else if (changeOnSelect) {
      commit(nextPath);
    }
  };

  return (
    <BasePopover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setActivePath(current); // 打开时同步浏览路径到已提交值
      }}
    >
      <BasePopover.Trigger
        disabled={disabled}
        {...(invalid && { "data-invalid": "", "aria-invalid": true })}
        className={cn(triggerVariants({ size }), className)}
      >
        <span className={cn("truncate text-left", !triggerLabel && "text-muted")}>{triggerLabel ?? placeholder}</span>
        <span className="flex shrink-0 text-muted transition-transform data-[popup-open]:rotate-180">
          <ChevronDownIcon />
        </span>
      </BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner side="bottom" align="start" sideOffset={6} className="z-50">
          <BasePopover.Popup
            className={cn(
              "flex max-h-[min(20rem,var(--available-height))] rounded-[var(--radius)] border border-border bg-surface text-foreground shadow-xl outline-none",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            )}
            style={overlayTransition}
          >
            {cols.map((list, colIndex) => (
              <ul
                key={colIndex}
                role="listbox"
                aria-label={`第 ${colIndex + 1} 级`}
                className="min-w-[9rem] overflow-y-auto border-border p-1 [&:not(:last-child)]:border-r"
              >
                {list.map((node) => {
                  const active = activePath[colIndex] === node.key;
                  const hasChildren = !!node.children?.length;
                  return (
                    <li key={node.key} role="none">
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        aria-disabled={node.disabled || undefined}
                        disabled={node.disabled}
                        onClick={() => onPick(colIndex, node)}
                        onMouseEnter={() => {
                          if (expandTrigger === "hover" && hasChildren && !node.disabled) {
                            setActivePath([...activePath.slice(0, colIndex), node.key]);
                          }
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-[min(var(--radius),0.375rem)] px-2 py-1.5 text-left text-sm outline-none transition-colors",
                          "hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                          active && "bg-primary/12 text-primary",
                          "disabled:pointer-events-none disabled:opacity-50",
                        )}
                      >
                        <span className="truncate">{node.label}</span>
                        {hasChildren ? <ChevronRight className="size-3.5 shrink-0 text-muted" aria-hidden /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ))}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
```

- [ ] **Step 5: 跑测试确认通过**

Run: `pnpm --filter @hulianui/ui test -- --run src/cascader/cascader.test.tsx`
Expected: PASS（2 测试）。

- [ ] **Step 6: showcase + index + 接线**

`cascader.showcase.tsx`：
```tsx
"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Cascader } from "./cascader";
import type { TreeNode } from "../tree/tree-core";

const NODES: TreeNode[] = [
  { key: "zhejiang", label: "浙江", children: [
    { key: "hangzhou", label: "杭州", children: [{ key: "xihu", label: "西湖区" }, { key: "binjiang", label: "滨江区" }] },
    { key: "ningbo", label: "宁波", children: [{ key: "haishu", label: "海曙区" }] },
  ] },
  { key: "jiangsu", label: "江苏", children: [
    { key: "nanjing", label: "南京", children: [{ key: "xuanwu", label: "玄武区" }] },
  ] },
];

function Demo({ expandTrigger, changeOnSelect }: { expandTrigger?: "click" | "hover"; changeOnSelect?: boolean }) {
  const [v, setV] = useState<string[]>([]);
  return (
    <div className="w-72">
      <Cascader nodes={NODES} value={v} onChange={(p) => setV(p)} expandTrigger={expandTrigger} changeOnSelect={changeOnSelect} placeholder="选择地区" />
    </div>
  );
}

export const cascaderShowcase: ShowcaseSpec = {
  controls: [
    { prop: "expandTrigger", type: "select", options: ["click", "hover"], defaultValue: "click", label: "expandTrigger" },
    { prop: "changeOnSelect", type: "boolean", defaultValue: false, label: "changeOnSelect（任意层可选）" },
  ],
  states: [
    { name: "默认（点击逐级 · 叶子提交）", render: () => <Demo /> },
    { name: "hover 展开", render: () => <Demo expandTrigger="hover" /> },
    { name: "changeOnSelect（任意层提交）", render: () => <Demo changeOnSelect /> },
  ],
  renderWithProps: (p) => <Demo expandTrigger={p.expandTrigger as "click" | "hover"} changeOnSelect={p.changeOnSelect as boolean} />,
  toCode: (p) =>
    `<Cascader\n  nodes={nodes}\n  expandTrigger="${(p.expandTrigger as string) ?? "click"}"${p.changeOnSelect ? "\n  changeOnSelect" : ""}\n  value={value}\n  onChange={(path) => setValue(path)}\n/>`,
};
```

`index.ts`：
```ts
export { Cascader } from "./cascader";
export type { CascaderProps } from "./cascader.types";
export { cascaderShowcase } from "./cascader.showcase";
```

主桶 + manifest + registry（同 Task 5 模式）：
- 主桶 `export * from "./cascader";`
- manifest（锚点 `slug: "tree-select"`）：
```ts
  { slug: "cascader", name: "Cascader", description: "级联选择 · 触发器 + Popover 横向逐级面板列 + 路径数组受控 + click/hover 展开 + changeOnSelect · 复用树引擎核", category: "inputs", status: "new" },
```
- registry：import `cascaderShowcase` + map `"cascader": cascaderShowcase`（锚点 `"tree-select": treeSelectShowcase,`）

- [ ] **Step 7: 测试 + 构建 + 提交**

```bash
pnpm --filter @hulianui/ui test -- --run && pnpm --filter @hulianui/www build
git add packages/ui/src/cascader/ packages/ui/src/index.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(ui): Cascader（Popover 横向逐级面板列 · 路径数组受控 · click/hover · 复用树引擎核）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: 三道门全绿 + 明暗截图

**Files:** 无新增；验证 + 可能微调皮肤。

- [ ] **Step 1: 两包 typecheck**

Run: `pnpm --filter @hulianui/ui exec tsc --noEmit && pnpm --filter @hulianui/www exec tsc --noEmit`
Expected: 无错误。
> www tsc 比 ui tsc 严格（含 next 类型）；若 `value: string|string[]` 在 showcase 触发联合类型报错，按报错收窄。

- [ ] **Step 2: 全量 vitest（--force 拿真实态）**

Run: `pnpm --filter @hulianui/ui test -- --run`
Expected: 全绿。并行 session WIP 致瞬时红时按 skill `turbo-test-red-isolate-untracked-wip-not-your-regression` 隔离判断——只看 `tree`/`tree-select`/`cascader` 三目录测试。

- [ ] **Step 3: www 构建 SSG**

Run: `pnpm --filter @hulianui/www build`
Expected: `/components/tree`、`/components/tree-select`、`/components/cascader` 三页 prerendered。共享锁竞争见 skill `nextjs-build-verify-isolated-distdir-when-shared-next-lock-contended`。

- [ ] **Step 4: 明暗两态截图**

桌面 app www 跑在 5514（`nextjs-16-dev-server-dedupes-by-project-dir-not-port`）。用隔离 chromium CDP（`mcp-browser-busy-launch-isolated-chromium-via-executablepath`）依次截三页明暗两态：
- tree：单选高亮 / checkable 半选 / 连接线 / 搜索过滤四态
- tree-select：单选 Trigger + 浮层树 / 多选 chip + checkable 浮层（先点 Trigger 开浮层再截，同 popover 先例）
- cascader：点 Trigger 开 + 逐级三列展开（先驱动点击下钻再截）
存 cwd 根 PNG，Read 看像素核对（`ui-layout-verify-needs-screenshot-not-dom-eval`）。连接线 L 形几何 / 半选横线 / 横向列分隔重点核。
> 若截图被并行环境彻底阻断，按成本纪律止损：功能（typecheck + 单测 + SSG）已充分，记录受阻原因。

- [ ] **Step 5: 更新记忆**

更新 `hulian-phase-status.md`：追加树引擎族条目（3 slug：tree/tree-select/cascader · Layer A 共享核 · 复用 nav-menu 范式不重构 · checkable 叶为真源模型 · 任何新沉淀坑），slug 计数 131→134。

---

## Self-Review（写完计划后自查）

**Spec 覆盖：**
- §3 Layer A 全函数 → Task 1（类型/index/flatten/path）+ Task 2（级联/搜索）✅
- §4 Tree（aria/roving/键盘/过渡/checkable/连接线/搜索）→ Task 3 + Task 4（连接线 CSS）✅
- §5 TreeSelect（单/多选/Popover/searchable）→ Task 5 ✅
- §6 Cascader（逐级列/路径/expandTrigger/changeOnSelect）→ Task 6 ✅
- §7 测试 → 各 Task 内 TDD + Task 7 截图 ✅
- §8 接线纪律 → 各 Task Step 接线 + Task 7 三道门 ✅
- §9 YAGNI → 未建对应 Task（正确，推迟项不实现）✅

**类型一致性：** `TreeNode`/`FlatRow`/`TreeIndex`/`CheckState` 在 Task 1-2 定义，Task 3-6 引用名一致；`toggleChecked/getCheckState/normalizeCheckedToLeaves/computeChecked/filterTree/getNodePath/buildIndex/flattenVisible` 签名跨 Task 一致。`TreeProps`/`TreeSelectProps`/`CascaderProps` 各自单一来源。

**Placeholder 扫描：** 无 TBD/TODO；每个 code step 含完整代码。连接线 CSS 与 `--color-border` 变量名标注「grep 实际名替换」为已知不确定点，非 placeholder。

**已知执行注意：**
1. Task 3 `tree.tsx` import 删 `getNodePath`（未用）；`FlatRow` 保留（typeahead/activate 形参）。
2. Tasspeak manifest/registry 用幂等命令插入，防并行 session 撞车。
3. Base UI Popover Trigger 是 `<button>` → 测试 `getByRole("button")` 命中 Trigger。
4. `Checkbox` 须支持 `indeterminate`/`checked`/`tabIndex`/`onClick` 透传——执行 Task 3 前先 `grep -n "indeterminate\|tabIndex\|onClick" packages/ui/src/checkbox/checkbox.types.ts` 确认；Base UI Checkbox.Root 透传这些，瑚琏 Checkbox 已 `{...props}` 应透传，若 types 未列则补。
