---
"@hulianui/ui": minor
---

Table / ProTable 四条消费方缺口（#236 #237 #238 #241）

- **组合原语出口（#241）**：新增 `TableRoot / TableHeader / TableBody / TableFooter / TableRow / TableHead / TableCell`，与高层 `Table` 并存。给「结构由业务自己写、只想要库皮肤」的表用——一行里嵌两层、整行是编辑器、按数据把一条拆成三行这类结构，写成 `ColumnDef[]` 只是把可读的表格结构翻译进 `cell` 回调。密度档位与分隔线/悬停/选中底色与高层 `Table` 同源，不是另一套皮肤。
- **常驻整宽行 + 表尾槽（#237）**：`Table` 新增 `renderRowExtra`（每条数据行之后挂 0..N 条附属行，不前插展开器列、不要求展开态）与 `footer`（渲染进 `<tfoot>`，口径同 `EditableTable.summary`，但空表也渲染）。两者的回调都带 `colSpan`（当前可见列数，含自动前插列）——整宽行的 `colSpan` 此前在组件外根本算不准。`renderRowExtra` 与 `cellSpan` 不能同开（同 `renderExpandedRow`）。
- **表头吸外部滚动容器（#238）**：`stickyHeader` 扩为 `boolean | "self" | "scrollParent"`，新增 `stickyHeaderOffset` 避开固定页头。`"scrollParent"` 下表格自身不产生滚动区、表头吸在页面/内容区上；该档会主动去掉外壳的 `overflow-x-auto`——`overflow-x: auto` 会让另一轴的 `visible` 一并计算成 `auto`，外壳自己就成了 scrollport 并把表头锚死在它身上（实测 Chromium 下表头随页面划走）。
- **列显隐受控出口 + 锁定列（#236）**：`ProTable` 新增 `columnVisibility` / `onColumnVisibilityChange`（口径同 `rowSelection`：传了就受控，缺省的键视为可见），列偏好可落库、跨设备还原；列上新增 `meta.lockVisible`，锁定列在「列设置」里置灰恒选中，受控值对它写 `false` 也不生效。

全部为新增能力，一个新 prop 都不传时渲染结果与 0.39.0 逐字相同。
