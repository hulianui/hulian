---
slug: tree
name: Tree
category: data-display
group: collection
tags: []
exports: [Tree, buildIndex, flattenVisible, getNodePath, toggleChecked, getCheckState, normalizeCheckedToLeaves, computeChecked, filterTree, type FlatRow, type TreeIndex, type CheckState]
status: enriched
---

# Tree

> 递归树 · 自研零依赖引擎 + WAI-ARIA tree(roving/方向键/typeahead) + checkable 父子级联半选 + 连接线 + 树内搜索 + grid-rows 高度过渡 · data-display/collection

## 何时用

展示并操作层级结构——文件目录、组织架构、分类导航、权限勾选树。扁平条目流用 [List](../list/list.md)；只读 JSON 结构用 [JsonViewer](../json-viewer/json-viewer.md)。本组件提供完整 WAI-ARIA tree 交互(方向键/typeahead)与 checkable 父子级联半选，适合需要键盘可达或勾选汇总的场景。

## 导入
```ts
import { Tree, buildIndex, flattenVisible, getNodePath, toggleChecked, getCheckState, normalizeCheckedToLeaves, computeChecked, filterTree, type FlatRow, type TreeIndex, type CheckState } from "@hulianui/ui"
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
| showLine | `boolean` | `false` | 显示连接线 |
| searchable | `boolean` | `false` | 树内搜索框 |
| searchPlaceholder | `string` | — | 搜索框占位 |
| className | `string` | — | — |
| aria-label | `string` | — | 树的无障碍标签 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onExpandedChange | `(keys: string[]) => void` | 展开变化回调 |
| onSelect | `(keys: string[], node: TreeNode) => void` | 选中回调 |
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
- **`label` 传 `ReactNode`（带高亮片段、图标、徽标…）时必须同时给 `searchText`**，否则内置搜索与键盘首字母跳转会退化成拿 `key` 去匹配 —— 用户按看得见的文字搜，一条都搜不出来。`label` 是字符串/数字时不用管。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
