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

> 表格 · TanStack headless + 列排序 + 列几何(size/align/ellipsis/resizable·固定列 offset 自动重算) + 行点击/整行导航(onRowClick/rowHref·冒泡隔离) + 行拖拽排序(rowDraggable·回传相对位置语义) + 空态 · data-display/collection

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
| striped | `boolean` | `true` | 偶数行斑马纹 |
| bordered | `boolean` | `true` | 外层描边 + 圆角；被 ProTable 卡片包裹时置 false 避免双框 |
| density | `"default" \| "middle" \| "compact"` | `"default"` | 行密度（仅调单元格内边距） |
| getRowId | `(row: TData, index: number) => string` | 按 index | 行稳定 key |
| rowClassName | `(row: TData, index: number) => string \| undefined` | — | 行级附加 className（与斑马/选中类合并，不覆盖） |
| layout | `"auto" \| "fixed"` | `"auto"` | 列宽布局：auto 只让显式写了 size/minSize/maxSize 的列出宽度，其余按内容自适应；fixed 每列都按 `getSize()` 出实宽、表宽 = 各列之和 |
| resizable | `boolean` | `false` | 列宽拖拽（表头右缘手柄，双击复位）。开启即强制 `layout="fixed"`；单列可用 `ColumnDef.enableResizing=false` 关掉，内建选择/展开器/拖拽列恒不可调宽 |
| columnSizing | `ColumnSizingState` | — | 受控列宽态（列 id → 像素宽）；不传走内部非受控 |
| onRowClick | `(row: TData, index: number) => void` | 关 | 行点击：整行 cursor-pointer + tabIndex=0 + 键盘 Enter/Space 可达（保持 row 语义）；行内交互元素冒泡隔离 |
| rowHref | `(row: TData, index: number) => string \| undefined` | 关 | 声明式整行导航：返回 href 该行点击/Enter 整页跳转（cmd/ctrl+点击新开 tab），返回 undefined 该行不可点 |
| enableRowSelection | `boolean \| ((row: Row<TData>) => boolean)` | 关 | 开行选择，自动前插复选框列（含全选）；函数可限定可选行 |
| rowSelection | `RowSelectionState` | — | 受控选择态 |
| getRowCanExpand | `(row: Row<TData>) => boolean` | — | 限定可展开行 |
| getSubRows | `(row: TData) => TData[] \| undefined` | — | 提供则启用树形（按 row.depth 缩进） |
| indent | `number` | `16` | 树形/明细每级缩进像素 |
| expanded | `ExpandedState` | — | 受控展开态（树形 + 明细共用） |
| columnFilters | `ColumnFiltersState` | — | 受控列筛选态 |
| rowDraggable | `boolean` | `false` | 开行拖拽排序（@dnd-kit，useSortable 挂在 `<tr>`）；组件不改 data，顺序由 onRowDragEnd 交还消费方 |
| dragHandle | `"row" \| "cell"` | `"cell"` | `cell` 前插手柄列只有手柄可抓；`row` 整行可抓（行内交互元素已做手势隔离） |
| getRowCanDrag | `(row: TData, index: number) => boolean` | 全可拖 | 返回 false 该行手柄禁用，既抓不起也不能当落点；树形子行（depth>0）恒不可拖 |
| virtual | `VirtualOptions` | 关 | 虚拟滚动（需 @tanstack/react-virtual）：`{ enabled; rowHeight?=44; height?=480; overscan?=8 }` |
| className | `string` | — | 根节点类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSortingChange | `OnChangeFn<SortingState>` | 排序变化回调 |
| onRowSelectionChange | `OnChangeFn<RowSelectionState>` | 选择变化回调 |
| onExpandedChange | `OnChangeFn<ExpandedState>` | 展开变化回调（树形 + 明细共用） |
| onColumnFiltersChange | `OnChangeFn<ColumnFiltersState>` | 列筛选变化回调 |
| onColumnSizingChange | `OnChangeFn<ColumnSizingState>` | 列宽变化回调（拖拽调宽时按 `onChange` 逐帧触发） |
| onRowDragEnd | `(e: RowDragEndEvent<TData>) => void` | 行拖拽结束（落点未变 / 越界不触发）。`e` = `{ activeId, overId, activeIndex, overIndex, position: "before" \| "after", activeRow, overRow, nextData }` |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| renderExpandedRow | `(row: Row<TData>) => ReactNode` | 渲染函数；提供则前插展开器列，展开行下渲染整宽明细面板 |
| emptyText | `ReactNode` | 空态文案（默认 `locale.table.empty`） |
| renderEmpty | `() => ReactNode` | 渲染函数；完全自定义空态（优先级高于 emptyText） |

列 meta 增量（写在 `ColumnDef.meta`）：

| meta | 类型 | 说明 | Element Plus 对应 |
|------|------|------|------|
| sticky | `"left" \| "right"` | 固定列贴左/右 | `fixed` |
| filterable | `boolean` | 表头渲染内置文本筛选框 | — |
| align | `"left" \| "center" \| "right"` | 单元格内容水平对齐 | `align` |
| headerAlign | `"left" \| "center" \| "right"` | 表头对齐；不写则跟随 `align` | `header-align` |
| ellipsis | `boolean` | 溢出截断 + 悬停 Tooltip 显示全文 | `show-overflow-tooltip` |

列宽走 TanStack 原生的 `ColumnDef.size / minSize / maxSize`（不另发明 `width` / `min-width`）：
`size` → `width`、`minSize` → `min-width`、`maxSize` → `max-width`，`th` 与 `td` 用同一口径的内联 style（不使用 `<colgroup>`）。

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

// 行点击：整行进详情（SPA 路由用 onRowClick + router.push）
<Table columns={columns} data={users} onRowClick={(row) => router.push(`/users/${row.id}`)} />

// 整行导航（整页跳转；cmd/ctrl+点击新开 tab）
<Table columns={columns} data={users} rowHref={(row) => `/users/${row.id}`} />

// 列几何：定宽 + 对齐 + 溢出省略（对标 el-table-column 的 width/align/show-overflow-tooltip）
const geoColumns: ColumnDef<DemoUser, any>[] = [
  { accessorKey: "name", header: "姓名", size: 120 },
  { accessorKey: "email", header: "邮箱", size: 180, meta: { ellipsis: true } },
  { accessorKey: "role", header: "角色", size: 100, meta: { align: "center" } },
  { accessorKey: "id", header: "编号", minSize: 120, meta: { align: "right", headerAlign: "right" } },
];
<Table columns={geoColumns} data={users} />

// 列宽拖拽（表头右缘拖动改宽，双击复位）；受控可持久化到用户偏好
<Table columns={geoColumns} data={users} resizable columnSizing={sizing} onColumnSizingChange={setSizing} />

// 行拖拽排序：回调给的是「相对位置」，不是重排后的数组
<Table
  columns={columns}
  data={rows}
  getRowId={(r) => r.id}
  enableSorting={false}
  rowDraggable
  onRowDragEnd={(e) => {
    setRows(e.nextData);                                  // 本地乐观更新
    api.sortable({                                        // 落库（对标 baTable.dragSort）
      move: e.activeId,
      target: e.overId,
      order: filter.order,
      direction: e.position === "after" ? "down" : "up",
    });
  }}
/>
```

## 禁忌 / 坑

- 列宽只认**显式写在 ColumnDef 上的** `size/minSize/maxSize`。没写 size 的列不会落宽度样式（保持内容自适应）——这是刻意的：TanStack 会把 `defaultColumn`（size 150）合并进每个 columnDef，照着 `getSize()` 无脑出宽度会把整张表钉成等宽。
- `meta.ellipsis` 要生效必须该列有确定宽度：给显式 `size`（会自动兜成 `max-width`）或 `maxSize`，或整表 `layout="fixed"`；否则 auto 布局下列被内容撑开，省略号永远不出现。Tooltip 全文取该列的**原始值**（string/number），自定义 cell 渲染成非文本（图片/按钮）时只截断不挂浮层。
- 固定列（`meta.sticky`）的 offset 由 `getStart/getAfter` 按 `getSize()` 累加得出，所以固定列的渲染宽会被**强制钉成 `getSize()`**（没写 size 就是默认 150）——想要多宽就显式写 `size`。同时内容要够宽触发横滚才看得到效果。
- `resizable` 会强制 `layout="fixed"`（拖拽必须有确定列宽）。fixed 下表宽 = 各列 `getSize()` 之和，窄于容器时靠 `min-w-full` 撑满、列宽被浏览器按比例放大——那种情况下没有横滚，固定列 offset 也就无从体现。
- `virtual` 是可选依赖（@tanstack/react-virtual），需手动安装；仅推荐大数据平铺表，不建议与树形/明细面板同开。
- `bordered` 默认 true 自带外框——嵌进 ProTable 或其他卡片容器时置 `false`，否则双层描边。
- 排序/选择/展开/筛选均「不传受控 prop 即内部非受控」；要受控就成对接上 `xxx` + `onXxxChange`。
- `rowHref` 走 `window.location.assign` 整页跳转——Next.js/SPA 里会丢客户端路由状态，客户端跳转请用 `onRowClick` + `router.push`。`onRowClick` 与 `rowHref` 同传时 `onRowClick` 优先，导航不执行。
- 行点击的冒泡隔离按选择器识别行内交互元素（`a/button/input/select/textarea/label` + `role=button/checkbox/switch/menuitem`）；自定义 cell 里的可点元素若不属于这些（如裸 `div` 加 onClick），点击会同时触发行级动作——给它补上语义 role 即可隔离。
- 行拖拽**不改 data**：`onRowDragEnd` 只回报落点，界面顺序要变必须自己把 `e.nextData`（或后端返回的新序）写回 `data`，否则拖完会弹回原位。
- 拖拽排序和列排序（`enableSorting`）同开没有意义：列排序下可见顺序 ≠ 存储顺序，拖出来的相对位置对后端是错的。要拖就把 `enableSorting` 关掉（或至少清空 `sorting`）。同理，筛选态下拖拽只在**可见行之间**表达相对位置。
- 拖拽 id 就是行 id：不传 `getRowId` 时行 id 是数组下标，回调里的 `activeId/overId` 也就只是下标。要把 id 直接甩给后端，必须传 `getRowId={(r) => r.id}`。
- `dragHandle="row"` 与 `onRowClick` 同开时，键盘 <kbd>Space</kbd> 归 dnd-kit（抓起/放下），行点击只保留 <kbd>Enter</kbd>；指针端靠 6px 距离阈值区分点击与拖拽。要完全零冲突就用默认的 `"cell"`。
- 拖拽与 `virtual` 同开不推荐：视口外的行没有挂载，拖到列表边缘时既无落点也不会自动翻页。
- 树形（`getSubRows`）下只有顶层行可拖，子行手柄恒禁用——跨层级拖拽的落点语义未定义，需要拖子节点请用 [Tree](../tree/tree.md) 或按层级拆表。

## 相关
[Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md) · [List](../list/list.md)
