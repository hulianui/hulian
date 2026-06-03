# 瑚琏树引擎族设计 — Tree / TreeSelect / Cascader

> 日期：2026-06-03 · 状态：已批准（brainstorm 锁定最大范围）
> 范围：自研一套递归树引擎（零依赖），派生 Tree / TreeSelect / Cascader 三件，计 3 个组件 slug。

## 1. 背景与目标

瑚琏 = 吸取式聚合设计系统。本批是 backlog 最大、价值最高的一条：一套递归树引擎。

**第一性裁决：不重复实现，也不重构已发版的 `nav-menu`。**

- `nav-menu`（commit `ca8b2d4`）已经是一套完整的 WAI-ARIA tree 引擎：`flattenVisible` 扁平化可见行 + roving tabindex + 方向键/Home/End/→展开/←收起 + 递归 `grid-rows:0fr↔1fr` 高度过渡 + 选中/展开双轨受控。但它**耦合了导航语义**（href / 分组分隔 / collapsed 飞出 / 选中即导航），不属于通用数据树。
- 因此：**复制其经过验证的范式肌肉**（flatten + roving + 键盘 + grid-rows 过渡），在新模块里**泛化**为通用数据树 + checkable，**不动 nav-menu**（已发版 + 语义不同 + 并发风险）。
- `listbox` 贡献单字符 typeahead 肌肉；`select`/`combobox`/`popover` 是 overlay 引擎参照；`checkbox` 有现成 `indeterminate` 三态可 dogfood。

**禁止三套并行实现** → 通过 **Layer A 共享纯逻辑核** 满足：类型、扁平化、勾选级联、路径、搜索过滤只写一份，三件全部消费。

## 2. 架构：两层分解

```
tree/
  tree-core.ts          # Layer A：零 React 零依赖纯逻辑核（三件共享）
  tree.tsx              # Layer B：<Tree> 视觉组件（缩进递归树）
  tree.types.ts
  tree.showcase.tsx
  tree.test.tsx         # 同时覆盖 tree-core 纯函数
  index.ts
tree-select/
  tree-select.tsx       # Base UI Popover 浮层 + 内嵌 <Tree>
  tree-select.types.ts
  tree-select.showcase.tsx
  tree-select.test.tsx
  index.ts
cascader/
  cascader.tsx          # Layer A 核 + 横向逐级面板列
  cascader.types.ts
  cascader.showcase.tsx
  cascader.test.tsx
  index.ts
```

`tree-select` / `cascader` 通过 `import { ... } from "../tree/tree-core"` 复用 Layer A。

**单元边界自检**：
- Layer A 做什么？纯数据变换（无 React、无 DOM），输入 nodes/keys，输出新 keys/状态/扁平行。可独立单测。
- Layer B 做什么？把 Layer A 的扁平行渲染成可访问、可键盘漫游、可展开过渡的树 UI。依赖 Layer A + React + 瑚琏 Checkbox/motion token。
- TreeSelect/Cascader 做什么？字段触发器 + 浮层；TreeSelect 内嵌 Layer B，Cascader 用 Layer A 自渲染横向列。依赖 Base UI Popover（仅借定位）+ Layer A（+ TreeSelect 额外依赖 Layer B）。

## 3. Layer A：`tree-core.ts`（纯逻辑核）

### 3.1 类型

```ts
export interface TreeNode {
  key: string;
  label: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface FlatRow {
  key: string;
  node: TreeNode;
  depth: number;            // 0 = 顶层
  hasChildren: boolean;
  expanded: boolean;
  disabled: boolean;
  parentKey: string | null;
  isLast: boolean;          // 在同级兄弟中是否末项（连接线用）
  ancestorIsLast: boolean[];// 各祖先层是否末项（连接线竖线断续用），length === depth
}

export interface TreeIndex {
  nodeMap: Map<string, TreeNode>;
  parentMap: Map<string, string | null>;
  childrenKeys: Map<string, string[]>;     // 直接子 key（含 disabled，渲染用）
  leafDescendants: Map<string, string[]>;  // 全部「启用叶」后代 key（勾选真源计算用）
}
```

### 3.2 函数

```ts
buildIndex(nodes: TreeNode[]): TreeIndex
// 一次遍历建四张表。leafDescendants 对每个枝节点收集其全部 enabled 叶后代；
// 叶节点自身若 enabled 则 leafDescendants[leaf] = [leaf]（统一处理）。

flattenVisible(nodes: TreeNode[], expandedSet: Set<string>): FlatRow[]
// 抄 nav-menu：按 DOM 顺序产出当前可聚焦行，只下钻 expandedSet 内的枝。
// 记录 isLast / ancestorIsLast 供连接线。

getNodePath(nodes: TreeNode[], key: string): TreeNode[]
// 根→目标节点的节点链（Cascader value 解析 + 标签链显示）。空数组 = 未找到。

// —— 勾选级联（叶为真源模型）——
toggleChecked(key: string, checked: boolean, leafSet: Set<string>, index: TreeIndex): Set<string>
// 返回新叶集：把 key 的全部 enabled 叶后代加入/移出。leaf 节点即自身。disabled 节点不参与。

getCheckState(key: string, leafSet: Set<string>, index: TreeIndex): "checked" | "indeterminate" | "unchecked"
// 叶：在 leafSet 即 checked。枝：全部 enabled 叶后代 ∈ leafSet → checked；部分 → indeterminate；无 → unchecked。

normalizeCheckedToLeaves(checkedKeys: string[], index: TreeIndex): Set<string>
// 受控入参可含枝 key（如外部按 antd 习惯传全选枝）→ 展开成 enabled 叶集，作为内部真源。
// 保证 round-trip 稳定：emit 含枝 → 再 ingest 展开回同一叶集。

computeChecked(leafSet: Set<string>, index: TreeIndex): { checkedKeys: string[]; halfCheckedKeys: string[] }
// 由叶真源派生 onCheck 回调载荷 + 渲染：checkedKeys 含「全选枝」，halfCheckedKeys 为半选枝。

filterTree(nodes: TreeNode[], query: string): { matchedKeys: Set<string>; autoExpandKeys: Set<string> }
// label（字符串化）含 query（不区分大小写）→ matchedKeys；命中节点的全部祖先 → autoExpandKeys。
// 空 query → 两个空集（不过滤）。
```

**勾选模型说明（为何叶为真源）**：以「启用叶」集合为唯一真源，枝状态一律派生（全/部分/无）。受控入参经 `normalizeCheckedToLeaves` 归一为叶集，emit 经 `computeChecked` 还原成「含全选枝」的惯用形态 → 双向稳定无漂移。disabled 节点既不可勾选也不计入 all/some 判定（与 antd 默认行为一致）。

## 4. Layer B：`<Tree>`

### 4.1 Props（受控/非受控对称三轨，家风同 nav-menu/Table）

```ts
export interface TreeProps {
  nodes: TreeNode[];
  // 展开
  expandedKeys?: string[];
  defaultExpandedKeys?: string[];
  onExpandedChange?: (keys: string[]) => void;
  // 单选高亮（非 checkable 模式）
  selectable?: boolean;            // 默认 true
  selectedKeys?: string[];
  defaultSelectedKeys?: string[];
  onSelect?: (keys: string[], node: TreeNode) => void;
  // 勾选
  checkable?: boolean;
  checkedKeys?: string[];
  defaultCheckedKeys?: string[];
  onCheck?: (info: { checkedKeys: string[]; halfCheckedKeys: string[] }, node: TreeNode) => void;
  // 视觉/交互
  showLine?: boolean;              // 连接缩进线
  searchable?: boolean;            // 顶部内置搜索框
  searchPlaceholder?: string;
  className?: string;
  "aria-label"?: string;
}
```

### 4.2 行为

- **a11y**：`<ul role="tree">` + 每行 `role="treeitem"` + `aria-expanded`(仅枝)/`aria-selected`/`aria-level`(depth+1)/`aria-setsize`/`aria-posinset`；子组 `role="group"`；勾选模式行内 Checkbox 不重复 treeitem 焦点（Checkbox `tabIndex=-1`，整行 treeitem 承载焦点，Space 切勾选）。
- **roving tabindex**：仅当前 active 行 `tabIndex=0`，其余 `-1`；无显式焦点时落首个选中行否则首行（抄 nav-menu `effectiveActive`）。
- **键盘**（容器 onKeyDown，抄 nav-menu + listbox）：↑↓ 移动；→ 枝未展开则展开/已展开则进首子；← 枝已展开则收起/否则回父；Home/End 首末行；单字符 typeahead（从当前行向后找 label 前缀匹配，抄 listbox）；Enter/Space：枝切展开，叶（selectable）切选中 / （checkable）切勾选。
- **展开过渡**：`grid-rows:0fr↔1fr` + `min-h-0 overflow-hidden` 内层，时长/曲线复用 `motionDurationCss/motionEaseCss`（reduced-motion 归零），**零 motion 运行时**（同 nav-menu/Accordion）。
- **checkable**：行首 dogfood 瑚琏 `Checkbox`，`indeterminate` 由 `getCheckState==="indeterminate"` 驱动；点击触发 `toggleChecked`，`onCheck` emit `computeChecked` 结果。
- **连接线（showLine）**：纯 CSS 伪元素，按 `depth`/`isLast`/`ancestorIsLast` 画 L 形竖横线（末项竖线半高断开）。
- **搜索（searchable）**：内部 `useState` searchValue，顶部搜索框（抄 combobox 搜索框气质）；非空时 `filterTree` 计算 matched + autoExpand，只渲染命中路径上的行、命中文本高亮。

## 5. TreeSelect

```ts
export interface TreeSelectProps {
  nodes: TreeNode[];
  value?: string | string[];        // 单选 key / 多选 keys
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;               // 多选 → 内嵌 checkable 树，value = checkedKeys
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  searchable?: boolean;
  showLine?: boolean;
  className?: string;
}
```

- **结构**：Base UI Popover `Root/Trigger/Portal/Positioner/Popup`（仅借定位 + mount/unmount，注意 `base-ui-overlay-positioner-requires-portal`），Popup 内放 `<Tree searchable={searchable} checkable={multiple} ...>`。
- **Trigger**：字段外壳（抄 `selectTriggerVariants` 气质，`size/invalid/disabled` + chevron），显示已选 label / placeholder。
- **单选**：点节点 → 设 value + 收起；点枝 → 展开（不收起）。任意节点可选（changeOnSelect 隐含 true，单选无叶限制）。
- **多选**：`checkable`，value=checkedKeys，停留开；Trigger 已选用 dogfood `Chip` 标签（可移除 ×，超量截断/计数）。
- **label 解析**：经 `buildIndex().nodeMap` key→node→label。

## 6. Cascader

```ts
export interface CascaderProps {
  nodes: TreeNode[];
  value?: string[];                 // 路径键数组（如 ["zhejiang","hangzhou","xihu"]）
  defaultValue?: string[];
  onChange?: (path: string[], nodes: TreeNode[]) => void;
  expandTrigger?: "click" | "hover";// 默认 click
  changeOnSelect?: boolean;         // 默认 false（仅叶子提交）；true 则任意层可提交部分路径
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}
```

- **结构**：Trigger 字段外壳 + Base UI Popover，Popup 内横向**逐级面板列**。列 0 = 根节点；选中有子节点项 → 展开下一列（`expandTrigger` 控点击/悬浮）；叶子选中 → 提交路径 + 收起（`changeOnSelect=true` 时任意层选中即提交部分路径）。
- **派生**：每列由 Layer A `childrenKeys` 取子集；`getNodePath` 解析受控 value 为高亮路径 + Trigger 标签链（`A / B / C`）。
- **多选 Cascader = YAGNI 推迟**（文档化为 future）。「单弹层模式」即「所有列同处一个 Popover Popup」，本设计即如此；独立内联面板（无触发器常驻）作 future。

## 7. 测试策略

- **tree-core 纯函数（富覆盖）**：`flattenVisible` 只下钻展开枝 + isLast 正确；`toggleChecked` 级联子树 + disabled 排除；`getCheckState` 全/部分/无三态；`normalizeCheckedToLeaves`↔`computeChecked` round-trip 稳定；`getNodePath`；`filterTree` 命中 + 祖先自动展开。
- **Tree**：渲染 treeitem 数与 aria-level/-expanded/-selected；roving（仅 active tabIndex=0）；展开切换；键盘 `fireEvent.keyDown` ↑↓/→/←/Home/End；checkable 点父级联子 + 半选态（dogfood Checkbox 的 `fireEvent.click` 可触发，同 Table 先例）。
- **TreeSelect**：Trigger 点击开浮层（Portal 在 jsdom 可 mount，同 popover 先例）；单选设 value + 收起；多选 checkable value=checkedKeys。
- **Cascader**：Trigger 开浮层；逐级下钻列渲染；叶子提交路径 `onChange`。
- **几何留截图**：连接线、grid-rows 过渡、缩进、横向列布局、明暗 token → 隔离 chromium CDP 截图（同 Accordion/Table 先例，MCP 浏览器被并行 session 占用时自起 ms-playwright chromium）。

## 8. 接线与纪律

- **每件五件套** + 桶 `index.ts` + 主 `packages/ui/src/index.ts` export + `apps/www/lib/manifest.ts` 一行 + `apps/www/lib/registry.tsx` import&map。
- **slug/分类**：`tree`→data-display；`tree-select`→inputs；`cascader`→inputs。status `new`。
- **零新依赖**：Base UI 已是 `@hulian/ui` dep，仅借 Popover 定位；lucide 图标已在用。
- **三道门全绿**：`tsc`(ui + www 两包) + vitest(`--force` 拿真实态) + `build --filter=www` SSG。
- **精确提交**：master 有他人未提交 WIP → 禁 `git add -A`；逐件 `git commit -- <具体路径>`，提交前核 diff 仅自己增量（见 skill `git-commit-head-plus-mine-via-plumbing-without-touching-worktree` / `parallel-session-git-add-all-sweeps-your-staged-files`）。manifest/registry 用幂等读改写插入缩竞争窗口。

## 9. 显式 YAGNI（推迟，文档化）

- 异步加载子节点（loadData）、虚拟滚动（大树）、拖拽排序、多选 Cascader、Cascader 独立内联面板、Tree 节点右键菜单/自定义行操作。皆纯增量后补，引擎结构零重构。
