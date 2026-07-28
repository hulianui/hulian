import type { ReactNode } from "react";
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
  }
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
  density?: "default" | "middle" | "compact";
  /** 行稳定 key；默认按行 index */
  getRowId?: (row: TData, index: number) => string;
  /**
   * 行级附加 className（按行数据/行号派生，如导入预览错误行标红、状态行着色）。
   * 返回 undefined 则该行不加；与斑马纹/选中态类合并，不覆盖。
   */
  rowClassName?: (row: TData, index: number) => string | undefined;
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

  // —— 空态（data 为空时）——
  /** 空态文案（渲染进内置 <Empty> 标题）。默认取 locale.table.empty（zhCN「暂无数据」）。 */
  emptyText?: ReactNode;
  /** 完全自定义空态渲染（优先级高于 emptyText）。 */
  renderEmpty?: () => ReactNode;
}
