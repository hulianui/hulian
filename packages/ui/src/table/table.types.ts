import type { ReactNode } from "react";
import type {
  ColumnDef,
  SortingState,
  RowSelectionState,
  ExpandedState,
  ColumnFiltersState,
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
} from "@tanstack/react-table";

// 列 meta 增量（模块增强）：固定列 + 列内置筛选框。皆为可选，不写即关。
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** 固定列：贴左/右。派生 TanStack 原生 columnPinning，offset 走 getStart/getAfter。 */
    sticky?: "left" | "right";
    /** 该列表头渲染内置文本筛选框（驱动 column.setFilterValue + getFilteredRowModel）。 */
    filterable?: boolean;
  }
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
  className?: string;

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

  // —— 虚拟滚动（不传=关·可选依赖）——
  virtual?: VirtualOptions;
}
