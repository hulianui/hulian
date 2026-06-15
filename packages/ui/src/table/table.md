---
slug: table
name: Table
category: data-display
group: collection
tags: []
exports: [Table]
status: enriched
---

# Table

> 表格 · TanStack headless + 列排序 + 空态 · data-display/collection

## 何时用

展示结构化二维数据（用户列表、明细表等）且需要排序/行选择/树形/虚拟滚动等表格能力时用。列定义直接复用 TanStack 的 `ColumnDef`，不发明平行 API。它是底层表格皮肤——需要查询区 + 工具栏 + 集成分页的完整列表页用 [ProTable](../pro-table/pro-table.md)（它内部就包了 Table）；单元格可编辑用 [EditableTable](../editable-table/editable-table.md)；纯垂直列表用 [List](../list/list.md)。

## 导入
```ts
import { Table } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| columns* | `ColumnDef<TData, any>[]` | — | TanStack 列定义（accessorKey/header/cell/meta.sticky/meta.filterable…） |
| data* | `TData[]` | — | 行数据 |
| enableSorting | `boolean` | `true` | false 则表头不可点、无排序箭头、不写 aria-sort |
| sorting | `SortingState` | — | 受控排序态；不传走内部非受控 |
| onSortingChange | `OnChangeFn<SortingState>` | — | 排序变化回调 |
| striped | `boolean` | `true` | 偶数行斑马纹 |
| bordered | `boolean` | `true` | 外层描边 + 圆角；被 ProTable 卡片包裹时置 false 避免双框 |
| density | `"default" \| "middle" \| "compact"` | `"default"` | 行密度（仅调单元格内边距） |
| getRowId | `(row: TData, index: number) => string` | 按 index | 行稳定 key |
| rowClassName | `(row: TData, index: number) => string \| undefined` | — | 行级附加 className（与斑马/选中类合并，不覆盖） |
| enableRowSelection | `boolean \| ((row: Row<TData>) => boolean)` | 关 | 开行选择，自动前插复选框列（含全选）；函数可限定可选行 |
| rowSelection | `RowSelectionState` | — | 受控选择态 |
| onRowSelectionChange | `OnChangeFn<RowSelectionState>` | — | 选择变化回调 |
| renderExpandedRow | `(row: Row<TData>) => ReactNode` | — | 提供则前插展开器列，展开行下渲染整宽明细面板 |
| getRowCanExpand | `(row: Row<TData>) => boolean` | — | 限定可展开行 |
| getSubRows | `(row: TData) => TData[] \| undefined` | — | 提供则启用树形（按 row.depth 缩进） |
| indent | `number` | `16` | 树形/明细每级缩进像素 |
| expanded | `ExpandedState` | — | 受控展开态（树形 + 明细共用） |
| onExpandedChange | `OnChangeFn<ExpandedState>` | — | 展开变化回调 |
| columnFilters | `ColumnFiltersState` | — | 受控列筛选态 |
| onColumnFiltersChange | `OnChangeFn<ColumnFiltersState>` | — | 列筛选变化回调 |
| virtual | `VirtualOptions` | 关 | 虚拟滚动（需 @tanstack/react-virtual）：`{ enabled; rowHeight?=44; height?=480; overscan?=8 }` |
| emptyText | `ReactNode` | `locale.table.empty` | 空态文案 |
| renderEmpty | `() => ReactNode` | — | 完全自定义空态（优先级高于 emptyText） |
| className | `string` | — | 根节点类名 |

列 meta 增量（写在 `ColumnDef.meta`）：`sticky?: "left" \| "right"`（固定列贴左/右）、`filterable?: boolean`（表头渲染内置文本筛选框）。

## 示例
```tsx
const columns: ColumnDef<DemoUser, any>[] = [
  { accessorKey: "name", header: "姓名" },
  { accessorKey: "email", header: "邮箱" },
  { accessorKey: "role", header: "角色" },
];

// 基础（默认可排序 + 斑马纹）
<Table columns={columns} data={users} />

// 行选择（自动前插复选框列 + 全选）
<Table columns={columns} data={users} enableRowSelection />
```

## 禁忌 / 坑

- 固定列（`meta.sticky`）的 offset 靠 TanStack 列宽推算，务必给相关列显式 `size`，否则贴左/右偏移不准；同时内容要够宽触发横滚才看得到效果。
- `virtual` 是可选依赖（@tanstack/react-virtual），需手动安装；仅推荐大数据平铺表，不建议与树形/明细面板同开。
- `bordered` 默认 true 自带外框——嵌进 ProTable 或其他卡片容器时置 `false`，否则双层描边。
- 排序/选择/展开/筛选均「不传受控 prop 即内部非受控」；要受控就成对接上 `xxx` + `onXxxChange`。

## 相关
[Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md) · [List](../list/list.md)
