---
slug: tree
name: Tree
category: data-display
group: collection
tags: []
exports: [Tree, buildIndex, flattenVisible, getNodePath, toggleChecked, getCheckState, normalizeCheckedToLeaves, computeChecked, filterTree, nodeSearchText, canDropOn, isDescendant, resolveDropPosition, type FlatRow, type TreeIndex, type CheckState]
status: enriched
---

# Tree

> 递归树 · 自研零依赖引擎 + WAI-ARIA tree(roving/方向键/typeahead) + checkable 父子级联半选 + 连接线 + 树内搜索 + grid-rows 高度过渡 · data-display/collection

## 何时用

展示并操作层级结构——文件目录、组织架构、分类导航、权限勾选树。扁平条目流用 [List](../list/list.md)；只读 JSON 结构用 [JsonViewer](../json-viewer/json-viewer.md)。本组件提供完整 WAI-ARIA tree 交互(方向键/typeahead)与 checkable 父子级联半选，适合需要键盘可达或勾选汇总的场景。

## 导入
```ts
import { Tree, buildIndex, flattenVisible, getNodePath, toggleChecked, getCheckState, normalizeCheckedToLeaves, computeChecked, filterTree, nodeSearchText, canDropOn, isDescendant, resolveDropPosition, type FlatRow, type TreeIndex, type CheckState } from "@hulianui/ui"
```

## Props

`TreeProps`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| nodes* | `TreeNode[]` | — | 树数据(`{ key, label, icon?, children?, disabled?, searchText? }`) |
| expandedKeys | `string[]` | — | 受控展开集 |
| defaultExpandedKeys | `string[]` | — | 非受控初始展开集 |
| selectable | `boolean` | `true` | 单选高亮(非 checkable 模式) |
| selectedKeys | `string[]` | — | 受控选中集 |
| defaultSelectedKeys | `string[]` | — | 非受控初始选中集 |
| checkable | `boolean` | `false` | 复选模式(行前 checkbox) |
| checkedKeys | `string[]` | — | 受控勾选集 |
| defaultCheckedKeys | `string[]` | — | 非受控初始勾选集 |
| expandTrigger | `"row" ｜ "icon"` | `"row"` | 什么东西触发展开。`"row"` 点整行展开（父节点因此**选不中**）；`"icon"` 只有左侧箭头管展开，行归 select/check，父节点可选 |
| draggable | `boolean` | `false` | 开启拖拽排序（原生 HTML5 拖放，不引 dnd-kit）。须同时传 `onDrop`，否则不生效 |
| allowDropInside | `(target: TreeNode) => boolean` | 一律允许 | 该目标是否接受「放进内部」（改父级）。返回 false 时只接受 before/after |
| virtual | `boolean \| { height?, itemHeight?, overscan? }` | `false` | 虚拟滚动（默认 height 320 / itemHeight 36 / overscan 8）。**开启后强制平铺渲染** |
| showLine | `boolean` | `false` | 显示连接线（`virtual` 开启时失效） |
| searchable | `boolean` | `false` | 树内搜索框 |
| searchPlaceholder | `string` | locale | 搜索框占位；显式传值优先于 locale。 |
| className | `string` | — | — |
| aria-label | `string` | locale | 树的无障碍标签；显式传值优先于 locale。 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onExpandedChange | `(keys: string[]) => void` | 展开变化回调 |
| onSelect | `(keys: string[], node: TreeNode) => void` | 选中回调 |
| onDrop | `(e: { dragKey, dropKey, position }) => void` | 拖拽落定。`position` 为 `"before"` / `"after"`（与目标同级排前/后）或 `"inside"`（成为目标的子节点） |
| onCheck | `(info: { checkedKeys: string[]; halfCheckedKeys: string[] }, node: TreeNode) => void` | 勾选回调(含半选集) |

## 示例
```tsx
// 单选 · 默认展开两枝
<Tree nodes={NODES} defaultExpandedKeys={["design", "components"]} defaultSelectedKeys={["theme"]} />

// 复选(父子级联半选) + 搜索
<Tree nodes={NODES} checkable searchable searchPlaceholder="搜索组件"
  onCheck={({ checkedKeys, halfCheckedKeys }) => save(checkedKeys)} />
```

## 禁忌 / 坑

- 展开/选中/勾选三组状态各自**受控/非受控对称**：传 `xxxKeys` 即受控(须配 `onXxx` 回写)，否则用 `defaultXxxKeys`。混用同一组的受控与非受控会失效。
- `selectable` 默认 `true`；`checkable` 模式下走勾选，`onCheck` 回调里 `checkedKeys` 与 `halfCheckedKeys` 分开返回，半选父节点不在 `checkedKeys` 里。
- `nodes` 每项需稳定 `key`。
- **`disabled` 只挡选中/勾选，不挡展开** —— 禁用的父节点仍能点开看子树（否则整棵子树彻底不可达）。要连展开都禁掉请在数据层就不给 `children`。
- **默认 `expandTrigger="row"` 下，有子节点的行永远不会触发 `onSelect`**（点它只展开）。要选目录/部门/任意层级分类，改 `expandTrigger="icon"`。「只能选叶子」是这个默认值的副作用，**不是契约**，别拿它当校验。
- **拖拽的顺序不归组件**：`onDrop` 只回传「谁落到谁的哪一侧」，`nodes` 仍由你按自家后端契约改
  （家风同 Table 的 `onRowDragEnd`）。组件已拦掉三种非法落点：丢到自己身上、丢进自己的子树（会成环）、
  `inside` 到自己的直接父级（等于没动却会触发一次写库）。非法落点不 `preventDefault`，
  浏览器自己显示「不可放置」光标。
- **`virtual` 与嵌套渲染互斥**：开了之后没有展开过渡、`showLine` 连接线失效（平铺后没有嵌套 DOM 可挂线）。
  `itemHeight` 必须与实际行高一致，否则滚动条长度会飘。
- **`virtual` 下 `itemHeight` 是固定值**，不做动态测量。行高会因 `label` 换行而变化的场景先别开虚拟。
- **`label` 传 `ReactNode`（带高亮片段、图标、徽标…）时必须同时给 `searchText`**，否则内置搜索与键盘首字母跳转会退化成拿 `key` 去匹配 —— 用户按看得见的文字搜，一条都搜不出来。`label` 是字符串/数字时不用管。
- 默认树标签、搜索占位和空结果文案跟随 `ConfigProvider`（`zhCN` / `enUS`）。显式 `aria-label` 与 `searchPlaceholder` 优先；旧自定义 locale 缺少 `components.tree` 时回退中文。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
