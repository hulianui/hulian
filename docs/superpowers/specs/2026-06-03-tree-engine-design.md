# 瑚琏 树引擎族设计 — Tree / TreeSelect / Cascader（一套自研递归树引擎）

- 日期：2026-06-03
- 阶段：P0/P1 backlog「树引擎族」（见 `hulian-absorption-model-v3.md` 与「桥 vs 自研」拍板：Tree/TreeSelect/Cascader 共用一套自研递归树引擎，**不进 MUI/Ant 桥**）
- 策略定位：**零依赖自研**（吃 token、可 RSC 降级、零运行时第三方），WAI-ARIA tree pattern，复用已自研 `listbox` 的 roving-tabindex / typeahead 肌肉

## 1. 第一性原理：三件共享什么

树是**层级数据**，但键盘导航发生在**「当前可见节点的扁平序列」**上（只有展开父节点的后代才可见）。这正是 `listbox` 的 roving/typeahead 肌肉——作用在一个由 `(nodes × expandedKeys)` 派生出的扁平数组上。

但 **Cascader 的导航模型不同**：逐级列（miller columns），上下=列内移动、左右=列间进退。硬把列导航塞进「扁平垂直序列」是自欺。所以「共用引擎」的诚实边界：

```
Tree / TreeSelect  → 共享「数据核 + 垂直 roving 引擎」
Cascader           → 共享「数据核」+ 复用现成 <Listbox> 做每一列（非第三套 roving）
```

没有任何一套 roving 被手写三遍 → 守住「禁止三套实现」。

## 2. 引擎模块 `packages/ui/src/tree/engine.ts(x)`

### 2.1 类型

```ts
export interface TreeNode {
  key: string;                 // 唯一键（选中/展开/禁用/回调都用它）
  label: ReactNode;            // 主文案；typeahead 取 string label，否则退化用 key
  children?: TreeNode[];       // 有 children（即使空数组）即视为父节点（可展开）
  disabled?: boolean;
  icon?: ReactNode;            // 行首图标插槽（同 listbox.startContent 家风）
}

export interface FlatNode {
  node: TreeNode;
  level: number;               // 1-based，落 aria-level
  parentKey: string | null;
  posinset: number;            // 1-based，同级位置 → aria-posinset
  setsize: number;             // 同级总数 → aria-setsize
  hasChildren: boolean;
  expanded: boolean;
}
```

「父节点」判定 = `Array.isArray(node.children)`（空数组也算父，可展开出空——交给消费者，引擎不擅自隐藏）。

### 2.2 纯函数（无 DOM，可单测）

- `flattenVisible(nodes, expandedSet, isDisabled): FlatNode[]`
  深度优先遍历；遇到未展开父节点则不下钻其后代。产出当前可见的扁平序列（携带 level/posinset/setsize/hasChildren/expanded）。
- `findNode(nodes, key): TreeNode | null` — 全树查找。
- `findPath(nodes, key): TreeNode[]` — key → 从根到该节点的有序节点链（Cascader value 还原列、TreeSelect 渲染路径 label 用）。
- `getChildren(nodes, key): TreeNode[]` — 取某 key 的直接子节点（Cascader 渲染下一列用）。

### 2.3 状态 hook `useTreeState(opts)`

受控/非受控对称（家风同 Table/Tabs/Slider）：

```ts
useTreeState({
  selectionMode?: "single" | "multiple",     // 默认 single
  expandedKeys?, defaultExpandedKeys?, onExpandedChange?,
  selectedKeys?, defaultSelectedKeys?, onSelectionChange?,
  disabledKeys?,                              // 与 node.disabled 合并
})
→ { expanded:Set, selected:Set, isDisabled, toggleExpand(key), select(key) }
```

- `toggleExpand`：在 expanded set 增删（非受控写内部 state + 总回调）。
- `select`：single → 替换为 `[key]`；multiple → toggle（**v1 独立多选，无父子级联、无 indeterminate 半选**——级联/半选是 checkbox-tree 大特性，标记 future，皮肤可不重构后补）。

### 2.4 垂直 roving hook `useRovingTree(flat, { isDisabled, onMove })`

listbox 肌肉的「树」泛化。owns roving `activeKey` + refs（按 flat 顺序），返回 `{ activeKey, setActive, getItemProps(flatNode), onKeyDown }`。

键盘（WAI-ARIA `tree` pattern）：

| 键 | 行为 |
|---|---|
| ↓ / ↑ | 可见扁平序列移动到下/上一个 enabled 节点（复用 listbox `step`） |
| Home / End | 第一个 / 最后一个可见 enabled 节点（复用 listbox `edge`） |
| → | 折叠的父→展开；已展开父→移到第一个子；叶子→无 |
| ← | 已展开父→收起；否则→跳到 parentKey 节点 |
| Enter / Space | 选中当前 active（经 `select`） |
| 单字符 | typeahead：可见序列内下一个 label 前缀匹配（复用 listbox `typeahead`，作用域 = flat） |

roving tabindex：恰有一个可见 treeitem `tabIndex=0`（active），其余 `-1`。指针 hover 同步 `activeKey`（同 listbox）。

ARIA：容器 `role="tree"`（multiple 时 `aria-multiselectable`）；每节点 `role="treeitem"` + `aria-level` + `aria-setsize` + `aria-posinset` + 父节点 `aria-expanded`（叶子不写）+ `aria-selected`（selectionMode 决定写不写）+ `aria-disabled`。缩进靠 `paddingLeft = level * step`（不写死像素层级数）。

## 3. 三件派生

### 3.1 Tree（`tree/tree.tsx`，"use client"）

= `useTreeState` + `flattenVisible` + `useRovingTree` → 渲染缩进行。每行：chevron（`hasChildren` 才渲，`expanded` 转 90°，点击/→ 切换）+ icon 插槽 + label + 选中态皮肤。皮肤照 listbox：active `ring-2 ring-ring` + `bg-surface-hover`，selected `bg-primary/12 text-primary` + 行尾 Check（multiple）。chevron 旋转用 `transition-transform` + motion-token CSS 镜像（零 motion 运行时）。

Props：`nodes` + `useTreeState` 全套受控/非受控 props + `className` + `aria-label`。

### 3.2 TreeSelect（`tree/tree-select.tsx`，"use client"）

= Base UI Popover（**Positioner 必包 Portal**，见 `base-ui-overlay-positioner-requires-portal`）触发器 + 弹层里塞 `<Tree selectionMode="single">`。

- 触发器 = 按钮，渲 `findPath(nodes,value)` 末节点 label（或路径 `华南 > 广东`，由 `showPath` prop，默认只末节点）；空值渲 placeholder。
- 选中节点 → 写 `value` + 默认关闭弹层（`closeOnSelect`，默认 true）。
- `value: string`（v1 单选）；`selectionMode` 透传 Tree，**多选 v1 触发器兜底渲「已选 N 项」**，chips 多选 UI 后补。
- 皮肤复用 select.tsx 触发器 + popover.tsx 弹层范式。

### 3.3 Cascader（`tree/cascader.tsx`，"use client"）

= 数据核派生「激活路径 → 渲染 N 列」；**每列复用现成 `<Listbox>`**。

- 状态 = `activePath: string[]`（受控 `value` / 非受控）。列 `i` 渲染 `getChildren(nodes, activePath[i-1])`（第 0 列渲根 `nodes`）。
- 每列 = `<Listbox selectionMode="single" selectedKeys={[activePath[i]]} onAction={key => 钻取/定值}>`：
  - 点中间节点（有 children）→ 截断 `activePath` 到该层 + 追加该 key → 多出一列；若 `changeOnSelect` 则同时 commit 值。
  - 点叶子 → commit `value = 新路径`（leaf-only 时只有这里 commit）。
- `value: string[]`（有序路径键）+ `onChange(path, nodes)`（回传节点链便于消费者拿 label）。
- `changeOnSelect?: boolean`（默认 **false = 仅叶子可选**，Ant 默认）。
- 列间 →/← 在 Cascader 层薄补（→ 进下一列首项并聚焦，← 回上一列）；列内 ↑↓/Home/End/typeahead 全由 Listbox 兜底。
- 皮肤：列容器 `flex` + 每列固定宽 + 列间 `border-r`；外壳同 popover surface。

## 4. 五件套 + 接线（每件唯一入口）

每件 = `*.tsx` + `*.types.ts` + `*.showcase.tsx`(必 "use client") + `*.test.tsx` + `index.ts` 桶导出；引擎额外 `engine.ts` + `engine.test.ts`（纯函数单测）。

- 主 barrel `packages/ui/src/index.ts`：`export *` 三件 + 引擎类型（`TreeNode`）。
- `apps/www/lib/manifest.ts`：三行（分类 = **navigation**；Tree/TreeSelect/Cascader）。
- `apps/www/lib/registry.tsx`：import + map 三个 showcase。
- showcase 必从主 barrel 导出（registry 消费），用 `ShowcaseSpec`（controls/states/renderWithProps/toCode）。

## 5. 测试边界

- **引擎纯函数**（`engine.test.ts`）：flattenVisible 的可见性（折叠不下钻 / posinset/setsize / level）、findNode/findPath/getChildren、useTreeState 受控非受控 + single/multiple toggle。这是引擎正确性的主战场。
- **Tree**（jsdom）：role=tree/treeitem、aria-level/expanded/selected/setsize/posinset、键盘 ↓↑→←/Home/End/Enter（jsdom 可测 focus 漫游与 aria）、chevron 类、缩进 paddingLeft。
- **TreeSelect**（jsdom）：受控 open 弹层 mount（Portal 在 jsdom 能 mount，同 popover）、触发器 label = 选中节点、closeOnSelect。定位几何 → 截图。
- **Cascader**（jsdom）：列数随 activePath 增长、叶子 commit、changeOnSelect、leaf-only 不 commit 中间节点。列几何 → 截图。
- 视觉（隔离 chromium CDP 明暗两态像素）：Tree 展开/选中/禁用、TreeSelect「先点开再截」、Cascader 多列联动「先钻取再截」。

## 6. 裁决与 YAGNI（明确推迟）

- **v1 多选无级联/无半选**（checkbox-tree 大特性，后补不重构皮肤）。
- **TreeSelect 多选 chips UI 推迟**（v1 单选主路 + 多选兜底文案）。
- **Cascader 默认 leaf-only**（`changeOnSelect` 透传）。
- 不做：异步加载子节点（`loadData`）、虚拟滚动、拖拽排序、搜索过滤、连接线（guide line）——皆 future，引擎留扩展点（数据核纯函数 + 受控状态便于外接）。
- 皮肤只消费语义 token（无 success）；明暗两态 token 自适应。

## 7. 文件清单

```
packages/ui/src/tree/
  engine.ts            # 类型 + 纯函数 + useTreeState + useRovingTree
  engine.test.ts       # 引擎纯函数 + hook 单测
  tree.tsx  tree.types.ts  tree.showcase.tsx  tree.test.tsx
  tree-select.tsx  tree-select.types.ts  tree-select.showcase.tsx  tree-select.test.tsx
  cascader.tsx  cascader.types.ts  cascader.showcase.tsx  cascader.test.tsx
  index.ts             # 桶导出三件 + 引擎类型
```

## 8. 三道门 + 提交纪律

- 三道门：`pnpm typecheck && pnpm test && pnpm build --filter=www`（build 必 `--filter=www`；基线/门禁用 `--force` 拿真实态，避 turbo cache 假绿）。
- **并发提交纪律（master 有他人未提交 WIP）**：全程精确 `git add <具体路径>` 绝不 `-A`；`git commit -- <pathspec>`（`-m` 在 `--` 前）；共享文件（index.ts/manifest/registry）`git diff HEAD` 确认仅自己增量，必要时临时移除他人未提交行→commit→复原，或 plumbing 接线（见 `git-commit-head-plus-mine-via-plumbing-without-touching-worktree`）。**只提交自己的件。**
