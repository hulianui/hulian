---
"@hulianui/ui": minor
---

Table 补单元格级 `cellClassName` 与列筛选控件可换 / 独立筛选行；Upload 根节点自带定位祖先不再撑高整页（#289 / #290 / #291）

- **`Table.cellClassName`（#289）** —— 逐 (行, 列) 派生类名并落在 `<td>` **本体**上，对标 el-table 的 `cell-class-name`、antd 的 `column.onCell`。`ctx = { row, rowIndex, rows, columnId, columnIndex, value }`，形状与 `cellSpan` 相同；返回 `undefined` 则该格不加，与斑马纹 / 选中态 / 固定列底色**合并**而不是覆盖。此前「按值着色」（同一列不同行不同底色的状态 / 阶段 / 优先级）无处可落：`rowClassName` 是行态、`meta` 那批是列态，而在 `ColumnDef.cell` 里套一层带背景的元素只是把色块画在 `<td>` **里面**，单元格内边距那一圈仍露出 td 自己的斑马 / 固定列底色。
- **`ColumnMeta.filterRender`（#290）** —— 换掉某一列的筛选控件（枚举列给下拉、日期列给日期控件、数字列给区间），`ctx = { value, setValue, column }`，`setValue(undefined)` 清除该列筛选。不写则维持内置文本框，默认行为逐字不变；写了它就等于该列可筛选，不必再写 `filterable`。
- **`Table.filterPlacement`（#290）** —— 默认 `"header"` 即历史行为（控件长在表头格里）；`"row"` 把控件挪到表头行**之下**独立的一整行，表头恢复单行高度、排序按钮不再与输入框挤在一格。多级表头下这一行贴在最末级列名之下、与叶子列一一对齐，并跟随固定列的 sticky 几何；没有任何可筛选列时整行不渲染。这一行渲染成 `<thead>` 里的 `<td>` 而非 `<th>`：它装的是控件不是列名，落成表头单元格会被读屏当作第二层列名念。
- **Upload 根节点恒 `relative`（#291·fix）** —— 隐藏的 file input 是 `sr-only`（`position: absolute` + clip）。祖先链全 `static` 时它的包含块退到初始包含块、`offsetParent` 落到 `<body>`，于是不受中间 `overflow` 容器裁剪，按自己在文档流里的纵坐标参与 `documentElement` 的滚动高度计算 —— 后台「视口定高 + 内容区自己滚」的长表单里表现为整页可滚（内容区滚到底后侧栏跟着上滑）。根节点自带定位祖先把它关回组件内部；消费方在业务侧给上传封装补 `relative` 的兜底可以撤掉。刻意不改成 `display: none`：挂了 `name` 的 input 要走原生表单提交与 `required` 校验，隐藏的必填控件会让浏览器静默拦下提交。
