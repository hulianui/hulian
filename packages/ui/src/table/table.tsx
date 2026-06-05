"use client";
import { Fragment, useMemo, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type ColumnPinningState,
  type SortingState,
  type RowSelectionState,
  type ExpandedState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight } from "../_icons";
import { Checkbox } from "../checkbox/checkbox";
import { cn } from "../lib/cn";
import type { TableProps } from "./table.types";

const SELECT_COL = "__select__";
const EXPANDER_COL = "__expander__";

// ── 固定列：从 TanStack 原生 pinning 读 offset，皮肤补 sticky 几何 ──────────
// （meta.sticky 只是初始 columnPinning 的派生源；offset 走 getStart/getAfter 不手算累加宽度）
function stickyStyle<TData>(column: Column<TData, unknown>): React.CSSProperties | undefined {
  const pinned = column.getIsPinned();
  if (!pinned) return undefined;
  return {
    position: "sticky",
    left: pinned === "left" ? column.getStart("left") : undefined,
    right: pinned === "right" ? column.getAfter("right") : undefined,
    zIndex: 1,
  };
}
function stickyClass<TData>(column: Column<TData, unknown>): string | undefined {
  const pinned = column.getIsPinned();
  if (!pinned) return undefined;
  // 固定列须实心底色（否则横滚时下层内容透出来）；边缘列加投影分隔（防 [[element-ui-table-fixed-right-overflow-leak]] 那类溢出/透漏）
  return cn(
    "bg-bg",
    pinned === "left" && column.getIsLastColumn("left") && "shadow-pin-left",
    pinned === "right" && column.getIsFirstColumn("right") && "shadow-pin-right",
  );
}

function colId<TData>(c: ColumnDef<TData, any>): string {
  if (c.id) return c.id;
  if ("accessorKey" in c && c.accessorKey != null) return String(c.accessorKey);
  return "";
}

// headless 逻辑（useReactTable）+ 瑚琏皮肤（render）。逻辑/皮肤同文件但段落分离。
export function Table<TData>({
  columns,
  data,
  enableSorting = true,
  sorting: sortingProp,
  onSortingChange,
  striped = true,
  density = "default",
  getRowId,
  className,
  // 行选择
  enableRowSelection,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  // 可展开明细
  renderExpandedRow,
  getRowCanExpand,
  // 树形
  getSubRows,
  indent = 16,
  // 展开受控（树形 + 明细共用）
  expanded: expandedProp,
  onExpandedChange,
  // 筛选
  columnFilters: columnFiltersProp,
  onColumnFiltersChange,
  // 虚拟滚动
  virtual,
}: TableProps<TData>) {
  const selectionEnabled = Boolean(enableRowSelection);
  const treeMode = Boolean(getSubRows);
  const panelMode = Boolean(renderExpandedRow);
  const hasExpander = treeMode || panelMode;

  // 受控/非受控对称：传 state+onChange 即受控，否则内部 useState（家风同 sorting/Tabs/Slider）
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const sorting = sortingProp ?? internalSorting;
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({});
  const rowSelection = rowSelectionProp ?? internalSelection;
  const [internalExpanded, setInternalExpanded] = useState<ExpandedState>({});
  const expanded = expandedProp ?? internalExpanded;
  const [internalFilters, setInternalFilters] = useState<ColumnFiltersState>([]);
  const columnFilters = columnFiltersProp ?? internalFilters;

  // 自动前插：选择列（含全选）+ 展开器列。前插列在用户列之前。
  const finalColumns = useMemo<ColumnDef<TData, any>[]>(() => {
    const lead: ColumnDef<TData, any>[] = [];
    if (selectionEnabled) {
      lead.push({
        id: SELECT_COL,
        size: 44,
        enableSorting: false,
        header: ({ table }) => (
          <Checkbox
            aria-label="全选"
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
            onCheckedChange={(v) => table.toggleAllRowsSelected(v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label="选择行"
            checked={row.getIsSelected()}
            indeterminate={row.getIsSomeSelected() && !row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onCheckedChange={(v) => row.toggleSelected(v)}
          />
        ),
      });
    }
    if (hasExpander) {
      lead.push({
        id: EXPANDER_COL,
        size: 44,
        enableSorting: false,
        header: () => null,
        cell: ({ row }) =>
          row.getCanExpand() ? (
            <button
              type="button"
              aria-label={row.getIsExpanded() ? "收起" : "展开"}
              aria-expanded={row.getIsExpanded()}
              onClick={row.getToggleExpandedHandler()}
              style={{ marginLeft: row.depth * indent }}
              className="inline-grid size-5 place-items-center rounded text-muted transition-colors hover:text-foreground"
            >
              <ChevronRight
                className={cn("size-4 transition-transform", row.getIsExpanded() && "rotate-90")}
              />
            </button>
          ) : (
            // 树形叶子：占位保持缩进对齐（明细模式 depth 恒 0 → 无缩进）
            <span style={{ marginLeft: row.depth * indent }} className="inline-block size-5" />
          ),
      });
    }
    return [...lead, ...columns];
  }, [columns, selectionEnabled, hasExpander, indent]);

  // 固定列：从用户列 meta.sticky 派生初始 pinning（静态，不随交互变）。
  // 若存在左固定列，前插的选择/展开器列也跟随固定到左侧，否则横滚会丢失它们。
  const columnPinning = useMemo<ColumnPinningState>(() => {
    const left: string[] = [];
    const right: string[] = [];
    const hasLeft = columns.some((c) => c.meta?.sticky === "left");
    if (hasLeft) {
      if (selectionEnabled) left.push(SELECT_COL);
      if (hasExpander) left.push(EXPANDER_COL);
    }
    for (const c of columns) {
      const s = c.meta?.sticky;
      if (s === "left") left.push(colId(c));
      else if (s === "right") right.push(colId(c));
    }
    return { left, right };
  }, [columns, selectionEnabled, hasExpander]);

  const table = useReactTable<TData>({
    data,
    columns: finalColumns,
    state: {
      sorting,
      rowSelection,
      expanded,
      columnFilters,
      columnPinning,
    },
    enableSorting,
    enableRowSelection,
    getRowCanExpand: panelMode && !treeMode ? (getRowCanExpand ?? (() => true)) : getRowCanExpand,
    getSubRows,
    onSortingChange: onSortingChange ?? setInternalSorting,
    onRowSelectionChange: onRowSelectionChange ?? setInternalSelection,
    onExpandedChange: onExpandedChange ?? setInternalExpanded,
    onColumnFiltersChange: onColumnFiltersChange ?? setInternalFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(hasExpander ? { getExpandedRowModel: getExpandedRowModel() } : {}),
    getRowId,
  });

  const colCount = table.getAllLeafColumns().length;
  const rows = table.getRowModel().rows;

  // 密度：仅作用于单元格内边距（表头/表体共用），default 维持原 px-3 py-2。
  const cellPad = { default: "px-3 py-2", middle: "px-3 py-1.5", compact: "px-2 py-1" }[density];

  // 虚拟滚动（可选）：hook 恒调用（无虚拟时 getScrollElement 返回 null → 闲置）。
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualEnabled = Boolean(virtual?.enabled);
  const rowHeight = virtual?.rowHeight ?? 44;
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: virtual?.overscan ?? 8,
  });

  const rowClass = (selected: boolean) =>
    cn(
      "border-b border-border transition-colors last:border-0 hover:bg-surface-hover",
      striped && "even:bg-surface-hover/40",
      selected && "bg-primary/10 hover:bg-primary/10",
    );

  const renderRow = (row: (typeof rows)[number]) => (
    <Fragment key={row.id}>
      <tr className={rowClass(row.getIsSelected())} data-selected={row.getIsSelected() || undefined}>
        {row.getVisibleCells().map((cell) => (
          <td
            key={cell.id}
            style={stickyStyle(cell.column)}
            className={cn(cellPad, "align-middle", stickyClass(cell.column))}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
      {panelMode && row.getIsExpanded() && (
        <tr className="border-b border-border last:border-0">
          <td colSpan={colCount} className="bg-surface-hover/30 px-3 py-3">
            {renderExpandedRow!(row)}
          </td>
        </tr>
      )}
    </Fragment>
  );

  // tbody 主体：虚拟模式只渲染视口窗口 + 上下撑高占位行
  let body: React.ReactNode;
  if (rows.length === 0) {
    body = (
      <tr>
        <td colSpan={colCount} className="py-10 text-center text-muted">
          暂无数据
        </td>
      </tr>
    );
  } else if (virtualEnabled) {
    const items = virtualizer.getVirtualItems();
    const padTop = items.length ? items[0].start : 0;
    const padBottom = items.length ? virtualizer.getTotalSize() - items[items.length - 1].end : 0;
    body = (
      <>
        {padTop > 0 && (
          <tr aria-hidden>
            <td colSpan={colCount} style={{ height: padTop, padding: 0 }} />
          </tr>
        )}
        {items.map((vi) => renderRow(rows[vi.index]))}
        {padBottom > 0 && (
          <tr aria-hidden>
            <td colSpan={colCount} style={{ height: padBottom, padding: 0 }} />
          </tr>
        )}
      </>
    );
  } else {
    body = rows.map(renderRow);
  }

  return (
    <div
      ref={scrollRef}
      style={virtualEnabled ? { height: virtual?.height ?? 480, overflow: "auto" } : undefined}
      className={cn(
        "rounded-[var(--radius)] border border-border",
        !virtualEnabled && "overflow-x-auto",
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">
        <thead
          className={cn(
            "text-muted",
            // 表头淡色带：与正文区分、提升可扫读性（主题感知，亮 gray-100 / 暗 gray-800）。
            // 虚拟滚动时表头 sticky，需 opaque 背景遮住滚动到下方的行，故用 bg-bg 不透明。
            virtualEnabled ? "sticky top-0 z-[2] bg-bg" : "bg-surface-hover",
          )}
        >
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-border">
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted(); // false | "asc" | "desc"
                const canFilter =
                  header.column.getCanFilter() && header.column.columnDef.meta?.filterable;
                return (
                  <th
                    key={header.id}
                    style={stickyStyle(header.column)}
                    aria-sort={
                      !canSort
                        ? undefined
                        : sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : "none"
                    }
                    className={cn(
                      cellPad,
                      "text-left font-medium",
                      stickyClass(header.column),
                      virtualEnabled && header.column.getIsPinned() && "bg-bg",
                    )}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex flex-col gap-1">
                        {canSort ? (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {sorted === "asc" ? (
                              <ChevronUp className="size-3.5" />
                            ) : sorted === "desc" ? (
                              <ChevronDown className="size-3.5" />
                            ) : (
                              <ChevronsUpDown className="size-3.5 opacity-50" />
                            )}
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                        {canFilter && (
                          <input
                            type="text"
                            value={(header.column.getFilterValue() as string) ?? ""}
                            onChange={(e) => header.column.setFilterValue(e.target.value)}
                            placeholder="筛选…"
                            aria-label={`筛选 ${header.column.id}`}
                            className="w-full rounded-[min(var(--radius),0.375rem)] border border-border bg-surface px-2 py-1 text-xs font-normal text-foreground outline-none transition-colors placeholder:text-muted focus:border-primary"
                          />
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>{body}</tbody>
      </table>
    </div>
  );
}
