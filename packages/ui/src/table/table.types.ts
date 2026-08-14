import type {
  HTMLAttributes,
  ReactNode,
  Ref,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import type {
  ColumnDef,
  SortingState,
  RowSelectionState,
  ExpandedState,
  ColumnFiltersState,
  ColumnSizingState,
  OnChangeFn,
  Row,
  RowData,
} from "@tanstack/react-table";

// 透传给消费者：列定义直接用 TanStack 的 ColumnDef，不发明瑚琏平行 API
export type {
  ColumnDef,
  SortingState,
  RowSelectionState,
  ExpandedState,
  ColumnFiltersState,
  ColumnSizingState,
} from "@tanstack/react-table";

/** 列内容水平对齐（对标 el-table-column 的 align / header-align）。 */
export type TableColumnAlign = "left" | "center" | "right";

/** 单元格垂直对齐（#194）。 */
export type TableCellVerticalAlign = "top" | "middle" | "bottom";

/** 单元格换行策略（#194）。 */
export type TableCellWhitespace = "nowrap" | "normal" | "pre-wrap";

/** 行密度（仅调单元格内边距）。高层 `Table` 与组合原语 `TableRoot` 共用同一档位。 */
export type TableDensity = "default" | "middle" | "compact";

// 列 meta 增量（模块增强）：固定列 / 筛选框 / 对齐 / 溢出省略。皆为可选，不写即关。
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** 固定列：贴左/右。派生 TanStack 原生 columnPinning，offset 走 getStart/getAfter。 */
    sticky?: "left" | "right";
    /** 该列表头渲染内置文本筛选框（驱动 column.setFilterValue + getFilteredRowModel）。 */
    filterable?: boolean;
    /** 单元格内容水平对齐；不写则沿用表格默认（左）。对标 el-table-column 的 `align`。 */
    align?: TableColumnAlign;
    /** 表头水平对齐；不写则跟随 `align`，两者都不写为左。对标 el-table-column 的 `header-align`。 */
    headerAlign?: TableColumnAlign;
    /**
     * 单元格溢出省略号 + 悬停 Tooltip 显示全文（对标 el-table-column 的 `show-overflow-tooltip`）。
     * 依赖该列有确定宽度：给显式 `size`（或 `maxSize`），或整表 `layout="fixed"`；
     * 否则列会被内容撑开，省略号不会出现。
     * Tooltip 全文取该列的**原始值**（string/number），非文本值只截断不挂浮层。
     */
    ellipsis?: boolean;
    /**
     * 单元格垂直对齐（#194）。不写则跟随表级 `cellVerticalAlign`，仍不写为 `middle`。
     * 表头不跟随，恒 `middle`。
     *
     * 允许换行的列几乎必然要 `top`：同一行里短单元格垂直居中、长单元格首行在上方，
     * 两者对不齐，整行读起来是散的。
     */
    verticalAlign?: TableCellVerticalAlign;
    /**
     * 换行策略（#194）。不写则跟随表级 `cellWhitespace`，仍不写为浏览器默认（换行）。
     *
     * · `nowrap` —— 日期 / 月数 / 状态这类短列，保持一行；
     * · `normal` —— 长文本换行（宽度上限用 `maxSize` 表达）；
     * · `pre-wrap` —— 连用户输入里的换行与空格一起保留（自动带 `break-words`，
     *   否则超长无空格串会撑破列宽）。
     *
     * 与 `ellipsis` 互斥：截断本身就要求单行，同传时以 `ellipsis` 为准。
     */
    whitespace?: TableCellWhitespace;
    /**
     * 锁定显隐（#236）：该列不允许在 `ProTable` 的「列设置」里被关掉，
     * 工具栏里置灰、勾选框恒选中。身份列（公司名）与操作列典型：关掉了这行就
     * 既没有身份也没有出口，那不是一个用户该被允许做出的选择。
     *
     * 锁的语义是「这列不给关」，所以受控的 `columnVisibility` 对它写 `false` 也不生效
     * —— 否则一份旧的列偏好落库值就能把出口关掉，而界面上根本打不开。
     */
    lockVisible?: boolean;
  }
}

/** 单元格跨度：缺省即 1；小于 1 表示该格不渲染（等价 el-table 的 `[0, 0]`）。 */
export interface TableCellSpan {
  rowSpan?: number;
  colSpan?: number;
}

/** `cellSpan` 回调的上下文。 */
export interface TableCellSpanContext<TData> {
  /** 当前行的原始数据。 */
  row: TData;
  /** 渲染顺序下标（排序/筛选之后），与 `rows` 同序。 */
  rowIndex: number;
  /** 当前可见行的原始数据，按渲染顺序 —— 「与上一行同值就合并」直接比 `rows[rowIndex - 1]`。 */
  rows: TData[];
  /** 列 id（内置列为 `__select__` / `__expander__` / `__drag__`，它们通常不该参与合并）。 */
  columnId: string;
  /** 可见列的下标（含内置前插列）。 */
  columnIndex: number;
  /** 该格的取值（`column.accessorKey` 解出来的原始值）。 */
  value: unknown;
}

/**
 * 行拖拽落点（相对目标行）：
 * · `"before"` —— 落在目标行之前（上移，对标 baTable 的 direction `"up"`）
 * · `"after"`  —— 落在目标行之后（下移，对标 baTable 的 direction `"down"`）
 */
export type RowDropPosition = "before" | "after";

/**
 * 行拖拽结束事件。
 *
 * 刻意回传**相对位置语义**（activeId / overId / position）而非只回吐重排后的数组——
 * 后端排序接口通常要 `{ move, target, order, direction }` 这种「把 move 挪到 target 的上/下」，
 * 只给新数组无法还原这个语义。映射示例：
 * ```ts
 * api.sortable({
 *   move: e.activeId,
 *   target: e.overId,
 *   order: filter.order,
 *   direction: e.position === "after" ? "down" : "up",
 * });
 * ```
 * 需要本地乐观更新的场景直接用 `nextData`（已按落点重排）。
 */
export interface RowDragEndEvent<TData> {
  /** 被拖拽行的 id（由 getRowId 派生；未传 getRowId 时为行在 data 中的下标字符串） */
  activeId: string;
  /** 落点目标行的 id */
  overId: string;
  /** 被拖拽行在拖拽前的可见行序（table 渲染行数组下标；无排序/筛选时等同 data 下标） */
  activeIndex: number;
  /** 目标行在拖拽前的可见行序 */
  overIndex: number;
  /** 相对目标行的落点：overIndex > activeIndex（向下拖）= "after"，反之 = "before" */
  position: RowDropPosition;
  /** 被拖拽行的原始数据 */
  activeRow: TData;
  /** 目标行的原始数据 */
  overRow: TData;
  /** 已按落点重排的新 data 数组（本地乐观更新用；组件自身不改 data） */
  nextData: TData[];
}

/** 虚拟滚动（可选·需 @tanstack/react-virtual）。仅推荐用于大数据平铺表，不建议与树形/明细面板同开。 */
export interface VirtualOptions {
  enabled: boolean;
  /** 每行估算高度(px)，默认 44。 */
  rowHeight?: number;
  /** 滚动容器固定高度(px)，默认 480。 */
  height?: number;
  /** 视口外预渲染行数，默认 8。 */
  overscan?: number;
}

/** `renderRowExtra` 的上下文（#237）。 */
export interface TableRowExtraContext {
  /**
   * 当前可见列数 —— 整宽行的 `colSpan` 直接用它。
   * 含自动前插的选择 / 展开器 / 拖拽手柄列，所以不是消费方 `columns.length`。
   */
  colSpan: number;
  /** 该行的渲染顺序下标（排序/筛选之后）。 */
  rowIndex: number;
}

/** `footer` 为函数形态时的上下文（#237）。 */
export interface TableFooterContext<TData> {
  /** 当前可见行的原始数据，按渲染顺序（已排序/筛选）—— 合计行按它算才与眼前的表一致。 */
  rows: TData[];
  /** 当前可见列数（同 `TableRowExtraContext.colSpan`）。 */
  colSpan: number;
}

/**
 * 表头吸顶的锚点（#238）：
 * · `"self"`（= `true`，默认口径）—— 吸在**表格自己的滚动区**上，必须配 `maxHeight`（或 `virtual`）；
 * · `"scrollParent"` —— 吸在**外部滚动容器**（页面 / AdminLayout 内容区）上，表格自身不滚。
 */
export type TableStickyHeaderMode = "self" | "scrollParent";

export interface TableProps<TData> {
  /** 列定义，直接用 TanStack ColumnDef（accessorKey/header/cell/meta.sticky/meta.filterable…） */
  columns: ColumnDef<TData, any>[];
  data: TData[];
  /** 默认 true；false 则表头不可点、不渲染排序箭头、不写 aria-sort */
  enableSorting?: boolean;
  /** 受控排序态；不传则组件内部非受控 useState */
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  /** 默认 true：偶数行斑马纹 */
  striped?: boolean;
  /** 默认 true：表格外层描边框 + 圆角。被 ProTable 卡片包裹时置 false，由卡片提供外框，避免双框。 */
  bordered?: boolean;
  /** 行密度：default 宽松 / middle 中等 / compact 紧凑（仅调单元格内边距，默认 default）。 */
  density?: TableDensity;
  /** 行稳定 key；默认按行 index */
  getRowId?: (row: TData, index: number) => string;
  /**
   * 行级附加 className（按行数据/行号派生，如导入预览错误行标红、状态行着色）。
   * 返回 undefined 则该行不加；与斑马纹/选中态类合并，不覆盖。
   */
  rowClassName?: (row: TData, index: number) => string | undefined;
  /**
   * 落在**滚动外壳**上，不是 `<table>` 本体（`stickyScrollbar` 开启时根节点还会再外移一层）。
   *
   * 所以 `min-w-*` 写在这里是错的：它钉住的是滚动容器，容器从此收不窄 → 横滚条永不出现 →
   * 超出视口的列被祖先裁掉且滚不出来。表本体的宽度下限用 `minWidth`（#193）。
   */
  className?: string;

  // —— 列几何（列宽 / 布局 / 拖拽调宽）——
  /**
   * 列宽布局模式：
   * · `"auto"`（默认）—— `table-layout: auto`。**只有显式写了** `size` / `minSize` / `maxSize`
   *   的列才落宽度样式，其余列按内容自适应（不写 size 的列绝不会被钉成 TanStack 的默认 150px）；
   * · `"fixed"` —— `table-layout: fixed`，每列都按 `column.getSize()` 出实宽，
   *   表格总宽 = `table.getTotalSize()`（不足容器时 `min-w-full` 兜底撑满）。
   *
   * 开启 `resizable` 时强制走 `"fixed"`（拖拽必须有确定宽度，否则手柄拖不动）。
   */
  layout?: "auto" | "fixed";
  /**
   * 列宽拖拽：表头右缘出拖拽手柄，实时改列宽（TanStack columnResizeMode="onChange"），
   * 双击手柄复位该列。开启即切 `layout="fixed"`。
   * 单列可用 `ColumnDef.enableResizing = false` 单独关闭；内建的选择列/展开器列恒不可拖。
   */
  resizable?: boolean;
  /** 受控列宽态（列 id → 像素宽）；不传则内部非受控。 */
  columnSizing?: ColumnSizingState;
  onColumnSizingChange?: OnChangeFn<ColumnSizingState>;

  // —— 行点击 / 整行导航（不传=关）——
  /**
   * 行点击回调（列表页点整行进详情）。开启后整行 cursor-pointer、tabIndex=0、
   * 键盘 Enter/Space 可达，保持 <tr> row 语义不换 role。
   * 行内交互元素（链接/按钮/表单控件，含自动前插的复选框/展开器）已做冒泡隔离，点它们不触发行级动作。
   */
  onRowClick?: (row: TData, index: number) => void;
  /**
   * 声明式整行导航：返回 href 则该行点击/Enter 整页跳转，cmd/ctrl+点击新开 tab；
   * 返回 undefined 则该行不可点。SPA 路由跳转（router.push）请用 onRowClick。
   * 与 onRowClick 同传时 onRowClick 优先，不再执行导航。
   */
  rowHref?: (row: TData, index: number) => string | undefined;
  /**
   * 行双击回调（后台列表「双击进编辑」的老习惯）。与 onRowClick 相互独立、可同传：
   * 双击时浏览器必然先派两次 click，所以 onRowClick 会先跑两次再跑这个 —— 两者都传时
   * 请保证 onRowClick 的动作可重入、且不与双击语义冲突（典型是单击选中、双击编辑）。
   * 行内交互元素上的双击同样不触发（复用行点击那套冒泡隔离）。
   */
  onRowDoubleClick?: (row: TData, index: number) => void;

  // —— 行选择（不传=关）——
  /** 开启行选择：自动前插复选框列（含表头全选）。可传布尔或 (row)=>boolean 限定可选行。 */
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  /** 受控选择态；不传则内部非受控。 */
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;

  // —— 可展开明细（不传=关）——
  /** 提供则前插展开器列，展开行下渲染整宽明细面板。 */
  renderExpandedRow?: (row: Row<TData>) => ReactNode;
  /** 限定哪些行可展开（明细模式默认全部可展开）。 */
  getRowCanExpand?: (row: Row<TData>) => boolean;

  // —— 常驻整宽行 / 表尾（不传=关）——
  /**
   * 每条数据行**之后**常驻挂 0..N 条整宽附属行（#237）。与 `renderExpandedRow` 是两件事：
   * 它不前插展开器列、不要求展开态、也不限一条 —— 「这条工作经历下面常驻挂 N 张职称证书」
   * 属于行的一部分而不是折叠明细。
   *
   * **返回的是裸 `<tr>`**（可以是数组 / Fragment / `null`），组件不替你包壳：
   * 附属行的分隔线、底色、`colSpan` 分几段全归你，包一层就再也表达不了「一条拆成三格」。
   * 整宽写法：`<tr><td colSpan={ctx.colSpan}>…</td></tr>`，`ctx.colSpan` 已含自动前插的
   * 选择/展开器/拖拽列，不要拿 `columns.length` 自己算。
   *
   * 与 `cellSpan` 不能同开（附属行插在数据行之间，纵向合并会跨过它们，同 `renderExpandedRow`）。
   */
  renderRowExtra?: (row: Row<TData>, ctx: TableRowExtraContext) => ReactNode;
  /**
   * 表尾 `<tfoot>` 内容（#237）：合计行、「+ 手动添加一条」这类常驻表尾行。
   * 口径同 `EditableTable.summary` —— **消费方自备 `<tr><td colSpan=…>`**，跨列对齐自己掌控。
   *
   * 传函数则拿到 `{ rows, colSpan }`（`rows` 是排序/筛选后的可见行原始数据）。
   * 与 `EditableTable.summary` 的一个区别：**空表也渲染**，因为「加一条」这类表尾行
   * 恰恰在空表时最需要出现。
   */
  footer?: ReactNode | ((ctx: TableFooterContext<TData>) => ReactNode);

  // —— 树形（不传=关）——
  /** 提供则启用树形：从行取子行；展开器内联进展开器列、按 row.depth 缩进。 */
  getSubRows?: (row: TData) => TData[] | undefined;
  /** 树形/明细的每级缩进像素，默认 16。 */
  indent?: number;

  // —— 展开受控态（树形 + 明细共用 TanStack expanded model）——
  expanded?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;

  // —— 筛选（无 filterable 列即关）——
  /** 受控列筛选态；不传则内部非受控。 */
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;

  // —— 行拖拽排序（不传=关）——
  /**
   * 开启行拖拽排序（@dnd-kit·useSortable 挂在 `<tr>` 上 + verticalListSortingStrategy）。
   * 组件**不改 data**——顺序由消费方按 onRowDragEnd 自行落库/重排（受控家风同 sorting/selection）。
   */
  rowDraggable?: boolean;
  /**
   * 拖拽把手：
   * · `"cell"`（默认）—— 前插一列手柄，只有手柄可抓起，与行点击 / 行内控件零冲突；
   * · `"row"` —— 整行任意位置可抓起（行内交互元素上已做冒泡隔离，点复选框/按钮不会起拖）。
   */
  dragHandle?: "row" | "cell";
  /** 拖拽结束回调（落点未变 / 越界不触发）。回传相对位置语义，详见 RowDragEndEvent。 */
  onRowDragEnd?: (event: RowDragEndEvent<TData>) => void;
  /**
   * 限定哪些行可拖：返回 false 则该行手柄禁用、既抓不起也不能作为落点。
   * 树形子行（row.depth > 0）恒不可拖（跨层级拖拽语义未定义）。
   */
  getRowCanDrag?: (row: TData, index: number) => boolean;

  // —— 虚拟滚动（不传=关·可选依赖）——
  virtual?: VirtualOptions;

  /**
   * 底部悬浮横向滚动条：宽表比视口高时，在视口底部常驻一条代理滚动条，
   * 不必把整页滚到表底才够得着真正的横向滚动条。
   *
   * 只在**需要**时出现：内容确实横向溢出、且表格底边已在视口之下；
   * 滚到表底（真滚动条自己看得见了）会自动收起，避免上下两条并排。
   *
   * 与 `meta.sticky` 冻结列共存（代理条在表格外，互不干涉）。
   * **`virtual` 开启时本项无效**——虚拟滚动的容器是定高的，横向滚动条一直贴在容器底边。
   *
   * ⚠️ 开启后表格外会多包一层 `div`（`position: sticky` 的代理条必须是滚动容器的**兄弟**，
   * 放进 `overflow-x-auto` 里面就只相对那个容器定位、永远贴不到视口底）。`className` 仍落在
   * 内层滚动容器上，所以在 flex / grid 父容器里，成为 item 的是这层外壳而不是它。
   * @default false
   */
  stickyScrollbar?: boolean;

  // —— 单元格排版（表级默认，列 meta 可逐列覆盖）——
  /**
   * 单元格垂直对齐的**表级默认**（#194）。默认 `middle`（与此前逐像素一致）。
   * 允许换行的表通常整表 `top`，个别列再用 `meta.verticalAlign` 调回来。
   */
  cellVerticalAlign?: TableCellVerticalAlign;
  /**
   * 换行策略的**表级默认**（#194）。不写即浏览器默认（换行）。
   * 典型形状是「表级 `nowrap` + 少数几列 `meta.whitespace: "normal"`」——
   * 宽表里日期/月数/状态保持一行，只有公司名/职务/描述几列换行。
   */
  cellWhitespace?: TableCellWhitespace;

  // —— 表头吸顶 / 宽度下限 ——
  /**
   * 表头吸顶（#192 / #238）。与 `virtual` 正交：虚拟滚动恒吸顶，普通表由本项开关。
   *
   * · `true` / `"self"` —— 吸在**表格自己的滚动区**上，**必须同时给 `maxHeight`**（或开 `virtual`）：
   *   sticky 要锚在一个真的会纵向滚动的祖先上，而表格外壳默认没有高度约束、永远不滚。
   *   只给这一项时组件在 dev 下告警并保持原样。
   * · `"scrollParent"` —— 吸在**外部滚动容器**（页面 / AdminLayout 内容区）上：表格自身不产生
   *   纵向滚动区，整张表跟着页面滚、表头钉在页面顶部。用 `stickyHeaderOffset` 避开自家固定页头。
   *
   * ⚠️ `"scrollParent"` 下外壳**不再有 `overflow-x-auto`**，表格自身不横向滚动 —— 这不是取舍
   * 而是 CSS 的硬约束：`overflow-x: auto` 会让另一轴的 `visible` 一并计算成 `auto`，于是外壳
   * 自己成了 scrollport，把表头锚死在它身上（实测滚动页面时表头直接划走）。横向溢出因此交给
   * 外部滚动容器。要「表内横滚 + 表头吸顶」只有 `"self"` + `maxHeight` 这一条路。
   * 同理 `stickyScrollbar`（代理横向滚动条）在这一档下无对象可镜像，会被忽略并在 dev 下告警。
   */
  stickyHeader?: boolean | TableStickyHeaderMode;
  /**
   * 吸顶表头的偏移量（#238，数值按 px），落成 `<thead>` 的 `top`。
   * 典型用途是避开自家的固定页头：`stickyHeaderOffset={56}`。
   * 不传即 `0`（与加这个 prop 之前逐字一致）。两档 `stickyHeader` 都生效。
   */
  stickyHeaderOffset?: number | string;
  /**
   * 表格滚动区的最大高度（数值按 px）。给了它外壳才会纵向滚动，
   * 也是 `stickyHeader` 生效的前提。`virtual` 开启时以 `virtual.height` 为准。
   */
  maxHeight?: number | string;
  /**
   * `<table>` 本体的宽度下限（#193）。
   *
   * **不要把 `min-w-*` 写进 `className`** —— 那落在**滚动外壳**上，容器从此收不窄，
   * `scrollWidth === clientWidth` 于是横滚条永不出现，超出视口的列被祖先直接裁掉且滚不出来
   * （数据不可达，而且宽窗口下自查不到，只有收窄到阈值以下才暴露）。
   */
  minWidth?: number | string;

  // —— 单元格合并（不传=关）——
  /**
   * 单元格合并（#176）：对标 el-table 的 `:span-method`、antd 的 `column.onCell`。
   * 逐格回调，返回该格要横跨/纵跨几格；返回 `undefined` 或 `{}` 即不合并。
   *
   * **被合掉的格子不会再回调**——只需在「一段的第一行」返回 `rowSpan`，
   * 后面那几行不必自己判断「我是不是被合掉的那格」（返回 `0` 也认，方便从 el-table 直译过来）。
   *
   * 回调拿到的 `rowIndex` 是**渲染顺序**（排序/筛选之后）的下标，`rows` 是同序的原始数据，
   * 所以「与上一行同门店就合并」这类判断直接比 `rows[rowIndex - 1]` 即可 —— 不会像 el-table
   * 那样一排序就整片错位。
   *
   * 不支持的组合（会静默不合并并在 dev 下告警）：
   * · `virtual` 虚拟滚动 —— 只渲染可见窗口，跨窗口的纵向合并无解；
   * · `renderExpandedRow` 明细展开 —— 展开面板是插在数据行之间的 `<tr>`，纵向合并会跨过它。
   */
  cellSpan?: (ctx: TableCellSpanContext<TData>) => TableCellSpan | void;

  // —— 空态（data 为空时）——
  /** 空态文案（渲染进内置 <Empty> 标题）。默认取 locale.table.empty（zhCN「暂无数据」）。 */
  emptyText?: ReactNode;
  /** 完全自定义空态渲染（优先级高于 emptyText）。 */
  renderEmpty?: () => ReactNode;
}

// ── 组合原语（#241）────────────────────────────────────────────────────────
// 高层 `Table` 是「数据 + 列定义 → 表」；原语是「结构你自己写，皮肤用库的」。
// 两条路并存，不互相包含：结构差异大的表（一行里嵌两层、整行是编辑器、按数据动态拆行）
// 翻译成 ColumnDef + cell 回调只会更难读，那不是配置该管的事。

/** `TableRoot`：滚动外壳 + `<table>`。密度/斑马纹经 context 下发给下面的原语。 */
export interface TableRootProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * **外层滚动容器**（`overflow-x-auto` 那层）的引用（#265）。
   *
   * 横向滚动态只存在于那一层：读写 `scrollLeft` / `scrollWidth`、挂 `ResizeObserver`、
   * 自绘底部悬浮横滚条都得从这里拿。绕不过去 —— 从子 `<table>` 往上 `parentElement`
   * 是在业务里写死实现细节（外壳哪天多包一层就断），在外面再套一个 `div` 拿到的
   * 又不是 scrollport（`scrollLeft` 恒为 0）。
   */
  ref?: Ref<HTMLDivElement>;
  /** 行密度（仅调单元格内边距），下发给 `TableHead` / `TableCell`。@default "default" */
  density?: TableDensity;
  /**
   * 偶数行斑马纹（只作用于 `TableBody` 里的行）。
   * 默认 `false` —— 与高层 `Table` 相反：手写结构里常有整宽附属行 / 跨行合并，
   * 「第几行」与视觉上的第几条记录对不上，斑马纹反而把结构读乱。
   * @default false
   */
  striped?: boolean;
  /** 外层描边 + 圆角。嵌进卡片时置 `false` 避免双框。@default true */
  bordered?: boolean;
  /** `table-layout`。@default "auto" */
  layout?: "auto" | "fixed";
  /** `<table>` **本体**的宽度下限（不要写进 `className`，那落在滚动外壳上）。 */
  minWidth?: number | string;
  /** `<table>` 本体的类名（`className` 落在外层滚动容器上）。 */
  tableClassName?: string;
}

/** `TableHeader`：`<thead>`。 */
export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
}
/** `TableBody`：`<tbody>`。 */
export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
}
/** `TableFooter`：`<tfoot>`（自带上边框 + 表尾底色 + 中等字重）。 */
export interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {
  ref?: Ref<HTMLTableSectionElement>;
}

/** `TableRow`：`<tr>`。分隔线/悬停/斑马纹按所在段（thead/tbody/tfoot）自动区分。 */
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  ref?: Ref<HTMLTableRowElement>;
  /** 选中态：主色底 + `data-selected`（同高层 `Table` 的选中行皮肤）。 */
  selected?: boolean;
}

/** `TableHead`：`<th>`（表头单元格，恒不换行 + 半粗）。 */
export interface TableHeadProps extends Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  ref?: Ref<HTMLTableCellElement>;
  /** 水平对齐（走 class，不是 HTML 的废弃 `align` 属性）。@default "left" */
  align?: TableColumnAlign;
}

/** `TableCell`：`<td>`。 */
export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  ref?: Ref<HTMLTableCellElement>;
  /** 水平对齐（走 class，不是 HTML 的废弃 `align` 属性）。@default "left" */
  align?: TableColumnAlign;
  /** 垂直对齐。@default "middle" */
  verticalAlign?: TableCellVerticalAlign;
}
