"use client";
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "../lib/cn";
import type { TableProps } from "./table.types";

// headless 逻辑（useReactTable）+ 瑚琏皮肤（render）。逻辑/皮肤同文件但段落分离。
export function Table<TData>({
  columns,
  data,
  enableSorting = true,
  sorting: sortingProp,
  onSortingChange,
  striped = true,
  getRowId,
  className,
}: TableProps<TData>) {
  // 受控/非受控对称：传 sorting+onSortingChange 即受控，否则内部 useState
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const sorting = sortingProp ?? internalSorting;

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: onSortingChange ?? setInternalSorting,
    enableSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
  });

  const colCount = table.getAllLeafColumns().length;
  const rows = table.getRowModel().rows;

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-[var(--radius)] border border-border",
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">
        <thead className="text-muted">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-border">
              {hg.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted(); // false | "asc" | "desc"
                return (
                  <th
                    key={header.id}
                    aria-sort={
                      !canSort
                        ? undefined
                        : sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : "none"
                    }
                    className="px-3 py-2 text-left font-medium"
                  >
                    {header.isPlaceholder ? null : canSort ? (
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
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="py-10 text-center text-muted">
                暂无数据
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-border transition-colors last:border-0 hover:bg-surface-hover",
                  striped && "even:bg-surface-hover/40",
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
