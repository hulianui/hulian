"use client";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Columns3, Maximize, Minimize, RefreshCw, Rows3 } from "../_icons";
import { Checkbox } from "../checkbox/checkbox";
import { useLocale } from "../config/locale";
import { cn } from "../lib/cn";
import { Pagination } from "../pagination/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { SearchForm } from "../search-form/search-form";
import { Table } from "../table/table";
import type { ProTableProps, ProTableToolbarFeatures } from "./pro-table.types";

const DENSITY_ORDER = ["default", "middle", "compact"] as const;
type Density = (typeof DENSITY_ORDER)[number];

const iconBtn =
  "inline-grid size-8 place-items-center rounded-[var(--radius)] text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

function colId<TData>(c: ColumnDef<TData, any>): string {
  if (c.id) return c.id;
  if ("accessorKey" in c && c.accessorKey != null) return String(c.accessorKey);
  return "";
}
function colLabel<TData>(c: ColumnDef<TData, any>): string {
  if (typeof c.header === "string") return c.header;
  return colId(c) || "—";
}

// ProTable = 列表页编排层（区别原子 Table）：查询区(复用 SearchForm) + 工具栏(密度/列设置/刷新/全屏)
// + Table + 分页(复用 Pagination)。状态(密度/列显隐/全屏)由 ProTable 自持，列显隐通过过滤 columns 实现
// （不侵入 Table）；其余表格能力全量透传给内部 Table。
export function ProTable<TData>(props: ProTableProps<TData>) {
  const {
    columns,
    title,
    toolbarActions,
    toolbar = true,
    search,
    onReload,
    loading,
    pagination,
    density: densityProp,
    rootClassName,
    className,
    ...tableProps
  } = props;

  const t = useLocale().proTable;

  const features: ProTableToolbarFeatures | null =
    toolbar === false
      ? null
      : {
          reload: true,
          density: true,
          columnSetting: true,
          fullscreen: true,
          ...(typeof toolbar === "object" ? toolbar : {}),
        };

  const [density, setDensity] = useState<Density>(densityProp ?? "default");
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [fullscreen, setFullscreen] = useState(false);

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hidden.has(colId(c))),
    [columns, hidden],
  );

  const cycleDensity = () =>
    setDensity((d) => DENSITY_ORDER[(DENSITY_ORDER.indexOf(d) + 1) % DENSITY_ORDER.length]);

  const toggleCol = (id: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        // 保底：不允许隐藏最后一列可见列，避免空表头
        if (columns.length - next.size <= 1) return prev;
        next.add(id);
      }
      return next;
    });

  const showToolbar = features !== null || title != null || toolbarActions != null;

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        // 列表页旗舰：整体即一张浮起卡片（表面 + 发丝边 + 阴影），与 Card 同层级，
        // 不再是漂在页面底色上的透明描边框。内层 Table 关掉自身边框避免双框。
        !fullscreen && "rounded-[var(--radius)] border border-hairline bg-surface p-4 shadow-sm",
        fullscreen && "fixed inset-0 z-50 overflow-auto bg-bg p-6",
        rootClassName,
      )}
    >
      {search && <SearchForm {...search} className={cn("m-0", search.className)} />}

      {showToolbar && (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 truncate text-base font-medium text-foreground">{title}</div>
          <div className="flex shrink-0 items-center gap-1.5">
            {toolbarActions}
            {(toolbarActions != null && (features?.reload || features?.density || features?.columnSetting || features?.fullscreen)) && (
              <span className="mx-0.5 h-4 w-px bg-border" aria-hidden />
            )}
            {features?.reload && (
              <button
                type="button"
                aria-label={t.reload}
                onClick={onReload}
                className={iconBtn}
              >
                <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              </button>
            )}
            {features?.density && (
              <button
                type="button"
                aria-label={`${t.density}：${density}`}
                title={`${t.density}：${density}`}
                onClick={cycleDensity}
                className={iconBtn}
              >
                <Rows3 className="size-4" />
              </button>
            )}
            {features?.columnSetting && (
              <Popover>
                <PopoverTrigger aria-label={t.columnSetting} className={iconBtn}>
                  <Columns3 className="size-4" />
                </PopoverTrigger>
                <PopoverContent title={t.columnsTitle} align="end" className="w-[min(90vw,14rem)]">
                  <div className="flex max-h-72 flex-col gap-2 overflow-auto">
                    {columns.map((c) => {
                      const id = colId(c);
                      return (
                        <label key={id} className="flex cursor-pointer items-center gap-2 text-sm">
                          <Checkbox checked={!hidden.has(id)} onCheckedChange={() => toggleCol(id)} />
                          <span className="truncate">{colLabel(c)}</span>
                        </label>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            )}
            {features?.fullscreen && (
              <button
                type="button"
                aria-label={fullscreen ? t.exitFullscreen : t.fullscreen}
                onClick={() => setFullscreen((f) => !f)}
                className={iconBtn}
              >
                {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
              </button>
            )}
          </div>
        </div>
      )}

      <Table<TData> columns={visibleColumns} density={density} bordered={false} className={className} {...tableProps} />

      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted">{t.total(pagination.total)}</span>
          <Pagination
            page={pagination.page}
            total={Math.max(1, Math.ceil(pagination.total / pagination.pageSize))}
            onPageChange={pagination.onPageChange}
            showFirstLast={pagination.showFirstLast ?? true}
          />
        </div>
      )}
    </div>
  );
}
