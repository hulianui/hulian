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

// 组合原语（结构自己写、只要库皮肤时用）
import {
  TableRoot, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell,
} from "@hulianui/ui"
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
| onRowDoubleClick | `(row: TData, index: number) => void` | 关 | 行双击（后台列表「双击进编辑」的老习惯）。与 `onRowClick` 相互独立、可同传；行内交互元素同样冒泡隔离 |
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
| cellSpan | `(ctx) => { rowSpan?, colSpan? } \| void` | — | 单元格合并（对标 el-table `:span-method`）。逐格回调，**被合掉的格子不再回调**；`ctx = { row, rowIndex, rows, columnId, columnIndex, value }`，`rowIndex` 是渲染顺序（排序/筛选之后）、`rows` 与之同序。与 `virtual` / `renderExpandedRow` 不能同开（会静默不合并 + dev 告警） |
| stickyHeader | `boolean ｜ "self" ｜ "scrollParent"` | `false` | 表头吸顶（与 `virtual` 正交）。`true` / `"self"` 吸在**表格自己的滚动区**上，**必须同时给 `maxHeight`**（否则外壳没有高度约束、永远不滚，sticky 没有可锚的滚动祖先，组件在 dev 下告警）；`"scrollParent"` 吸在**外部滚动容器**（页面 / 内容区）上，表格自身不滚，但外壳也就**不再有 `overflow-x-auto`**（见「禁忌 / 坑」） |
| stickyHeaderOffset | `number ｜ string` | `0` | 吸顶表头的偏移（数值按 px），落成 `<thead>` 的 `top`，用来避开自家固定页头（`stickyHeaderOffset={56}`）。两档都生效 |
| maxHeight | `number ｜ string` | — | 滚动区最大高度（数值按 px）。给了它外壳才纵向滚动；`virtual` 开启时以 `virtual.height` 为准 |
| minWidth | `number ｜ string` | — | `<table>` **本体**的宽度下限。写进 `className` 的 `min-w-*` 钉的是滚动外壳，会让横滚条永不出现、超出视口的列被裁掉且滚不出来 |
| cellVerticalAlign | `"top" ｜ "middle" ｜ "bottom"` | `"middle"` | 单元格垂直对齐的表级默认；列 `meta.verticalAlign` 覆盖 |
| cellWhitespace | `"nowrap" ｜ "normal" ｜ "pre-wrap"` | — | 换行策略的表级默认；列 `meta.whitespace` 覆盖。典型形状是「表级 nowrap + 少数几列 normal」 |
| virtual | `VirtualOptions` | 关 | 虚拟滚动（需 @tanstack/react-virtual）：`{ enabled; rowHeight?=44; height?=480; overscan?=8 }` |
| stickyScrollbar | `boolean` | `false` | 底部悬浮横向滚动条：宽表比视口高时在视口底部常驻一条代理滚动条，不必滚到表底才够得着。仅在「确实横向溢出 + 表格底边已在视口之下」时出现，滚到表底自动收起。与冻结列共存；**`virtual` 或 `maxHeight` 开启时无效**（外壳自己就是定高滚动容器，真滚动条一直看得见，再挂一条会上下两条并排）。⚠️ 开启后表格外多包一层 `div`（sticky 的代理条必须是滚动容器的兄弟），`className` 仍落在内层滚动容器上——flex / grid 父容器里成为 item 的是这层外壳 |
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
| renderRowExtra | `(row: Row<TData>, ctx: { colSpan, rowIndex }) => ReactNode` | 每条数据行**之后**常驻挂 0..N 条附属行。**返回裸 `<tr>`**（数组 / Fragment / `null` 均可），组件不替你包壳；整宽写法 `<tr><td colSpan={ctx.colSpan}>`。不前插展开器列、不要求展开态。与 `cellSpan` 不能同开 |
| footer | `ReactNode ｜ ((ctx: { rows, colSpan }) => ReactNode)` | 表尾 `<tfoot>` 内容（合计行 / 常驻「+ 添加一条」行）。口径同 `EditableTable.summary`：**消费方自备 `<tr><td colSpan=…>`**；`ctx.rows` 是排序/筛选后的可见行。与 `summary` 的区别是**空表也渲染** |
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
| verticalAlign | `"top" ｜ "middle" ｜ "bottom"` | 单元格垂直对齐（表头不跟随，恒 middle）。允许换行的列几乎必然要 `top` | — |
| whitespace | `"nowrap" ｜ "normal" ｜ "pre-wrap"` | 换行策略。`pre-wrap` 保留原文换行与空格并自动带 `break-words`。与 `ellipsis` 互斥（截断本身要求单行） | — |
| lockVisible | `boolean` | 锁定显隐：该列不允许在 [ProTable](../pro-table/pro-table.md) 的「列设置」里被关掉（置灰 + 恒选中），受控的 `columnVisibility` 对它写 `false` 也不生效。身份列与操作列典型 | — |

列宽走 TanStack 原生的 `ColumnDef.size / minSize / maxSize`（不另发明 `width` / `min-width`）：
`size` → `width`、`minSize` → `min-width`、`maxSize` → `max-width`，`th` 与 `td` 用同一口径的内联 style（不使用 `<colgroup>`）。

## 组合原语

`TableRoot / TableHeader / TableBody / TableFooter / TableRow / TableHead / TableCell` 七件薄包，
给「结构由业务自己写、只想要库的表格皮肤」的表。判据不是「Table 不够用」，而是**配置表达不了结构**：
一行里嵌两层、整行是一个编辑器、按数据把一条拆成三行 —— 写成 `ColumnDef[]` 就是把可读的表格结构
翻译进 `cell` 回调，代码只会更难读。所以两条路并存：数据驱动 + 要排序/分页/冻结列走高层 `Table`，
其余走原语。皮肤（密度档位、分隔线、悬停、选中底色）与高层 `Table` 同源，不是「长得差不多的另一套」。

### TableRoot

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| density | `"default" ｜ "middle" ｜ "compact"` | `"default"` | 行密度，经 context 下发给 `TableHead` / `TableCell` |
| striped | `boolean` | `false` | 偶数行斑马纹（只作用于 `TableBody` 里的行）。默认与高层 `Table` **相反**：手写结构常有整宽附属行 / 跨行合并，「第几行」与视觉上的第几条记录对不上 |
| bordered | `boolean` | `true` | 外层描边 + 圆角；嵌进卡片时置 `false` 避免双框 |
| layout | `"auto" ｜ "fixed"` | `"auto"` | `table-layout` |
| minWidth | `number ｜ string` | — | `<table>` **本体**的宽度下限（`className` 落在滚动外壳上，`min-w-*` 写那儿会让横滚条永不出现） |
| tableClassName | `string` | — | `<table>` 本体的类名 |

`TableHeader` / `TableBody` / `TableFooter` 只接原生 `<thead>` / `<tbody>` / `<tfoot>` 属性。

### TableRow / TableHead / TableCell

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| selected | `boolean` | `false` | `TableRow`：选中态（主色底 + `data-selected`，同高层 `Table` 的选中行皮肤） |
| align | `"left" ｜ "center" ｜ "right"` | `"left"` | `TableHead` / `TableCell`：水平对齐。走 class，不是 HTML 的废弃 `align` 属性 |
| verticalAlign | `"top" ｜ "middle" ｜ "bottom"` | `"middle"` | `TableCell`：垂直对齐 |

`TableRow` 的分隔线 / 悬停 / 斑马纹按所在段自动区分（表头行不 hover、不斑马纹，也不吃 `last:border-0`
—— 单行表头就是最后一行，那条规则会把表头底边线抹掉），消费方不用自己记这个差别。

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

// 常驻整宽附属行 + 表尾（不是明细展开：没有展开器列、不需要展开态、一行可挂多条）
<Table
  columns={columns}
  data={periods}
  renderRowExtra={(row, ctx) =>
    row.original.titles.map((t) => (
      <tr key={t.id} className="bg-surface-hover/30">
        <td colSpan={ctx.colSpan} className="px-3 py-1.5">{t.name}</td>
      </tr>
    ))
  }
  footer={(ctx) => (
    <tr>
      <td colSpan={ctx.colSpan} className="px-3 py-2">
        <Button variant="ghost" size="sm" onClick={addPeriod}>+ 手动添加单位</Button>
      </td>
    </tr>
  )}
/>

// 表头吸在页面滚动容器上（表格自身不滚），避开 56px 的固定页头
<Table columns={columns} data={rows} stickyHeader="scrollParent" stickyHeaderOffset={56} />

// 多级表头（分组列，对标 el-table-column 嵌套）：在列上套一层 columns 即可，
// 组名自动横跨它的叶子列并居中；不在组里的列纵向跨满两行，不会在上面留空表头。
const groupedColumns: ColumnDef<DemoRow, any>[] = [
  { accessorKey: "zone", header: "战区" },                       // 独立列，跨两行
  {
    id: "wecom",
    header: "企业微信",                                           // 组名，跨两列
    columns: [
      { accessorKey: "dept", header: "部门名", size: 220 },        // 宽度写在叶子列上
      { accessorKey: "users", header: "部门成员数" },
    ],
  },
  { id: "mini", header: "小程序", columns: [
      { accessorKey: "store", header: "门店名" },
      { accessorKey: "pos", header: "POS编码" }] },
];
<Table columns={groupedColumns} data={rows} />

// 组合原语：结构自己写，皮肤用库的
<TableRoot density="compact">
  <TableHeader>
    <TableRow>
      <TableHead>字段</TableHead>
      <TableHead align="right">值</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {fields.map((f) => (
      <TableRow key={f.key} selected={f.key === active}>
        <TableCell>{f.label}</TableCell>
        <TableCell align="right">{f.editing ? <Input defaultValue={f.value} /> : f.value}</TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={2}>共 {fields.length} 项</TableCell>
    </TableRow>
  </TableFooter>
</TableRoot>

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
- **`columns` 必须 memo。** cell 函数经 TanStack 的 `flexRender` 被**当作组件类型**渲染，identity 一变整格**卸载重挂**（不是重渲染）。展示表只是白烧性能；格子里有输入框时直接坏功能：受控输入框每敲一个字失焦 + 光标跳到末尾，挂了 `onBlur` 提交的还会被重挂时的 blur 触发**误提交**（半截值直接进库），非受控的则被 `defaultValue` 复位丢字。三个症状都不长得像「columns 没 memo」，排查会先怀疑输入框本身。同理 `useMemo` 的依赖里**不要放逐键变化的输入值** —— 那等于没 memo；行内编辑优先让输入框非受控（`defaultValue` + 提交时读 DOM）。
- 表头吸顶要 `stickyHeader` **加** `maxHeight`：sticky 需要一个真的会纵向滚动的祖先，而外壳默认只有 `overflow-x-auto`、没有高度约束。业务侧套 `[&_thead]:sticky` 也够不到（中间隔着这层 overflow 容器）。
- **「表内横滚 + 表头吸页面」是拿不到的组合**，这是 CSS 的硬约束不是实现取舍：`overflow-x: auto` 会让另一轴的 `visible` 一并计算成 `auto`，于是那层外壳自己成了 scrollport，把表头锚死在它身上（实测 Chromium：页面下滚时表头直接划走，同一张表换成 `overflow: visible` 的外壳才稳稳停在 `top: 0`）。所以 `stickyHeader="scrollParent"` 下组件**主动去掉**外壳的 `overflow-x-auto`，横向溢出交给外部滚动容器；`stickyScrollbar` 在这一档下没有可镜像的容器，会被忽略并告警。要保住表内横滚就只能用 `"self"` + `maxHeight`。
- `renderRowExtra` 与 `renderExpandedRow` 是两件事，别拿后者顶前者：明细面板**每行只能一条、必须展开态、且强制前插一列展开器**。「这条工作经历下面常驻挂 N 张证书」属于行的一部分，不是折叠明细。
- `renderRowExtra` / `footer` 返回的是**裸 `<tr>`**，组件不替你包 `<tr><td>`：包了就再也表达不了「一条附属行拆成三格」。整宽行的 `colSpan` 一定要用回调给的 `ctx.colSpan` —— 它含自动前插的选择 / 展开器 / 拖拽手柄列，`columns.length` 算出来的数会短一到三列，表现是最右边空出一块。
- `renderRowExtra` 与 `cellSpan` 不能同开（同 `renderExpandedRow`）：附属行插在数据行之间，纵向合并会跨过它们。同开时静默不合并 + dev 告警。
- `renderRowExtra` 与 `virtual` 同开会让虚拟化的行高估算失准（它按「一条数据 = 一行 `rowHeight`」撑占位行），表现是滚动漂移 / 底部留白。组件只告警不关闭（关了附属行就没了，比错位更难查）；附属行条数固定时把 `virtual.rowHeight` 调成「数据行 + 附属行」的总高即可。
- 宽表的宽度下限用 `minWidth`，**不要写进 `className`**：`className` 落在滚动外壳上，`min-w-*` 会让容器再也收不窄 → `scrollWidth === clientWidth` → 横滚条永不出现，超出视口的列被祖先裁掉且滚不出来。宽窗口下自查不到，只有收窄到阈值以下才暴露。
- `meta.whitespace` 与 `meta.ellipsis` 是互斥的两条路：截断本身要求单行。要「不截断、只换行」的核对型表格，用 `whitespace: "normal"` + `maxSize` 限宽 + `verticalAlign: "top"`（换行列不配顶对齐，同一行的短单元格会浮在中线上、与长单元格首行对不齐）。
- `meta.ellipsis` 要生效必须该列有确定宽度：给显式 `size`（会自动兜成 `max-width`）或 `maxSize`，或整表 `layout="fixed"`；否则 auto 布局下列被内容撑开，省略号永远不出现。Tooltip 全文取该列的**原始值**（string/number），自定义 cell 渲染成非文本（图片/按钮）时只截断不挂浮层。
- 固定列（`meta.sticky`）的 offset 由 `getStart/getAfter` 按 `getSize()` 累加得出，所以固定列的渲染宽会被**强制钉成 `getSize()`**（没写 size 就是默认 150）——想要多宽就显式写 `size`。同时内容要够宽触发横滚才看得到效果。
- `resizable` 会强制 `layout="fixed"`（拖拽必须有确定列宽）。fixed 下表宽 = 各列 `getSize()` 之和，窄于容器时靠 `min-w-full` 撑满、列宽被浏览器按比例放大——那种情况下没有横滚，固定列 offset 也就无从体现。
- `cellSpan` 的回调**只在没被合掉的格子上跑**，所以「与上一行同门店就合并」的写法是：在段首返回整段长度（`while (rows[i + n]?.store === rows[i].store) n++`），后面几行根本不会被问到。从 el-table 直译过来的 `[0, 0]` 写法也认（返回 `rowSpan: 0` 即该格不渲染）。
- `cellSpan` 拿到的 `rowIndex` 是**渲染顺序**的下标（排序/筛选之后），`rows` 也是同序的 —— 这正是 el-table 里「开了列排序合并就整片错位」那个坑的解法：判断只比数据，不依赖原始下标。
- `cellSpan` 与 `virtual`、`renderExpandedRow` **不能同开**：前者只渲染可见窗口、跨窗口的纵向合并没有落点，后者会把明细 `<tr>` 插在数据行之间、被纵向合并跨过。同开时组件静默不合并并在 dev 下告警（而不是画出一张错位的表）。
- `cellSpan` 与冻结列（`meta.sticky`）同开时，横向合并**不要跨过冻结边界**：冻结列的 offset 按未合并的原始列宽累加，跨边界的 colSpan 会让贴边那格错位。
- **多级表头下，冻结（`meta.sticky`）只作用到叶子列**：冻结是按叶子列的累计宽度算 offset 的，横跨若干列的组名格没有自己的 offset，横滚时它会跟着内容走、只有下面那行的列头贴住边缘。分组表 + 冻结列的组合请把要冻结的列放在组外（独立列纵向跨满，观感与冻结一致）。
- **多级表头的排序 / 筛选挂在叶子列上**，组名那格不出排序按钮：组列本身没有取值器，排的是哪一列没有定义。要按组内某列排就在那个叶子列上开 `enableSorting`。
- 分组时列宽写在**叶子列**上（`size` / `minSize` / `maxSize`）。写在组上不会分配给下面的列——组的宽度是各叶子列之和。
- 行选择框挂在每一行上，被纵向合并的行**仍然是独立的一行**（选择/拖拽都按行算），合并只是视觉上的并格。
- `virtual` 是可选依赖（@tanstack/react-virtual），需手动安装；仅推荐大数据平铺表，不建议与树形/明细面板同开。
- `bordered` 默认 true 自带外框——嵌进 ProTable 或其他卡片容器时置 `false`，否则双层描边。
- 排序/选择/展开/筛选均「不传受控 prop 即内部非受控」；要受控就成对接上 `xxx` + `onXxxChange`。
- `rowHref` 走 `window.location.assign` 整页跳转——Next.js/SPA 里会丢客户端路由状态，客户端跳转请用 `onRowClick` + `router.push`。`onRowClick` 与 `rowHref` 同传时 `onRowClick` 优先，导航不执行。
- `onRowClick` 与 `onRowDoubleClick` 同传时，浏览器双击必然先派两次 `click`，所以 `onRowClick` 会先跑两次。请保证它的动作可重入、且不与双击语义冲突（典型安排：单击选中、双击进编辑）。
- 行点击的冒泡隔离按选择器识别行内交互元素（`a/button/input/select/textarea/label` + `role=button/checkbox/switch/menuitem`）；自定义 cell 里的可点元素若不属于这些（如裸 `div` 加 onClick），点击会同时触发行级动作——给它补上语义 role 即可隔离。
- 行拖拽**不改 data**：`onRowDragEnd` 只回报落点，界面顺序要变必须自己把 `e.nextData`（或后端返回的新序）写回 `data`，否则拖完会弹回原位。
- 拖拽排序和列排序（`enableSorting`）同开没有意义：列排序下可见顺序 ≠ 存储顺序，拖出来的相对位置对后端是错的。要拖就把 `enableSorting` 关掉（或至少清空 `sorting`）。同理，筛选态下拖拽只在**可见行之间**表达相对位置。
- 拖拽 id 就是行 id：不传 `getRowId` 时行 id 是数组下标，回调里的 `activeId/overId` 也就只是下标。要把 id 直接甩给后端，必须传 `getRowId={(r) => r.id}`。
- `dragHandle="row"` 与 `onRowClick` 同开时，键盘 <kbd>Space</kbd> 归 dnd-kit（抓起/放下），行点击只保留 <kbd>Enter</kbd>；指针端靠 6px 距离阈值区分点击与拖拽。要完全零冲突就用默认的 `"cell"`。
- 拖拽与 `virtual` 同开不推荐：视口外的行没有挂载，拖到列表边缘时既无落点也不会自动翻页。
- 组合原语没有排序 / 分页 / 冻结列 / 虚拟滚动 —— 它只是皮肤。需要这些能力就回高层 `Table`，不要在原语上手搓一套。
- 原语的 `striped` 默认 `false`（与高层 `Table` 相反）：手写结构里常有整宽附属行与跨行合并，斑马纹按 `<tr>` 计数，会把「一条记录」的视觉分组读乱。确实是规整的一行一条时再显式开。
- 树形（`getSubRows`）下只有顶层行可拖，子行手柄恒禁用——跨层级拖拽的落点语义未定义，需要拖子节点请用 [Tree](../tree/tree.md) 或按层级拆表。

## 相关
[Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md) · [List](../list/list.md)
