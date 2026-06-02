import type { ColumnDef, SortingState, OnChangeFn } from "@tanstack/react-table";

// 透传给消费者：列定义直接用 TanStack 的 ColumnDef，不发明瑚琏平行 API
export type { ColumnDef, SortingState } from "@tanstack/react-table";

export interface TableProps<TData> {
  /** 列定义，直接用 TanStack ColumnDef（accessorKey/header/cell…） */
  columns: ColumnDef<TData, any>[];
  data: TData[];
  /** 默认 true；false 则表头不可点、不渲染排序箭头、不写 aria-sort */
  enableSorting?: boolean;
  /** 受控排序态；不传则组件内部非受控 useState */
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  /** 默认 true：偶数行斑马纹 */
  striped?: boolean;
  /** 行稳定 key；默认按行 index */
  getRowId?: (row: TData, index: number) => string;
  className?: string;
}
