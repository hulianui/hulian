"use client";
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { ColumnDef, RowSelectionState, SortingState } from "@tanstack/react-table";
import { Columns3, Maximize, Minimize, RefreshCw, Rows3 } from "../_icons";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { useLocale } from "../config/locale";
import { cn } from "../lib/cn";
import { Pagination } from "../pagination/pagination";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../select";
import { SearchForm } from "../search-form/search-form";
import { Spin } from "../spin/spin";
import { Table } from "../table/table";
import type {
  ProTableProps,
  ProTableRequestParams,
  ProTableSort,
  ProTableToolbarFeatures,
} from "./pro-table.types";

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

// SortingState（TanStack）→ 服务端单列 sort 协议。
function toProSort(s: SortingState): ProTableSort | null {
  if (!s.length) return null;
  return { field: s[0].id, order: s[0].desc ? "desc" : "asc" };
}

// ProTable = 列表页编排层。两种模式：
//  · 展示模式（不传 request）：data/pagination/loading 由消费者控制（向后兼容旧用法）。
//  · 托管模式（传 request）：ProTable 自管 page/pageSize/sort/filters/loading/data/选择，
//    任一变化即调 request（带竞态守卫，后发先至只采纳最新）。
export function ProTable<TData>(props: ProTableProps<TData>) {
  const {
    columns,
    title,
    toolbarActions,
    toolbar = true,
    search,
    onReload,
    loading: loadingProp,
    pagination: paginationProp,
    density: densityProp,
    rootClassName,
    className,
    // 托管模式
    request,
    onRequestError,
    paginationMode = "page",
    defaultPageSize = 10,
    pageSizeOptions,
    actionRef,
    batchActions,
    // 行选择（展示模式下原样透传；托管模式 / 批量条 时由本层接管）
    enableRowSelection,
    rowSelection: rowSelectionProp,
    onRowSelectionChange,
    data: dataProp,
    sorting: sortingProp,
    onSortingChange,
    getRowId,
    ...tableProps
  } = props;

  const t = useLocale().proTable;
  const managed = Boolean(request);
  const cursorMode = managed && paginationMode === "cursor";

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

  // —— 托管模式状态 ——
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [fetched, setFetched] = useState<{
    data: TData[];
    total: number;
    nextCursor: string | null;
    hasMore: boolean;
  }>({ data: [], total: 0, nextCursor: null, hasMore: false });
  const [fetching, setFetching] = useState(false);
  const reqSeq = useRef(0);
  // ref 持有错误回调：回调身份变化不应重发请求（effect 依赖里不放它）。
  const onRequestErrorRef = useRef(onRequestError);
  onRequestErrorRef.current = onRequestError;
  // cursor 模式游标栈：stack[i] = 第 i+1 页的入参 cursor（第 1 页恒为 null）。
  // 上一页 = 弹栈；filters/sort/pageSize 变化 = 重置为 [null]（旧游标钉死了
  // 签发时的排序/筛选语义，跨条件复用会拿到错页或被服务端 422）。
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const resetCursor = () => setCursorStack([null]);

  // 行选择：托管模式（或需要批量条）由本层持有，以便观测选中集合。
  const selfControlSelection = managed || batchActions != null;
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({});
  const rowSelection = selfControlSelection ? internalSelection : rowSelectionProp;
  const setSelection = selfControlSelection ? setInternalSelection : onRowSelectionChange;

  const sortParam = useMemo(() => toProSort(sorting), [sorting]);
  const filtersKey = JSON.stringify(filters);
  // cursor 模式下驱动拉数的键（page 模式恒空串，不触发多余请求）。
  const cursorKey = cursorMode
    ? `${cursorStack.length}:${cursorStack[cursorStack.length - 1] ?? ""}`
    : "";

  // 托管模式拉数（竞态守卫：只接受最新一次 seq 的结果）。
  useEffect(() => {
    if (!request) return;
    const seq = ++reqSeq.current;
    setFetching(true);
    const params: ProTableRequestParams = cursorMode
      ? {
          page: cursorStack.length,
          pageSize,
          sort: sortParam,
          filters,
          cursor: cursorStack[cursorStack.length - 1],
        }
      : { page, pageSize, sort: sortParam, filters };
    request(params)
      .then((res) => {
        if (seq !== reqSeq.current) return;
        setFetched({
          data: res.data,
          total: res.total ?? 0,
          nextCursor: res.nextCursor ?? null,
          hasMore: res.hasMore ?? res.nextCursor != null,
        });
      })
      // 失败兜底（page / cursor 两模式同路径）：不让 rejection 变 unhandled，
      // 保留上一次成功数据；loading 由下方 finally 统一复位。
      .catch((err) => {
        if (seq !== reqSeq.current) return;
        if (onRequestErrorRef.current) onRequestErrorRef.current(err);
        else console.error("[ProTable] request failed:", err);
      })
      .finally(() => {
        if (seq === reqSeq.current) setFetching(false);
      });
    // filters 用 filtersKey 稳定依赖；sortParam 已 memo；cursor 栈用 cursorKey 稳定依赖。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, page, pageSize, sortParam, filtersKey, reloadKey, cursorKey]);

  const clearSelection = () => setInternalSelection({});
  const doReload = () => {
    if (managed) setReloadKey((k) => k + 1);
    else onReload?.();
  };

  // 托管模式排序变化：cursor 模式必须重置游标栈（游标钉死签发时排序）。
  const handleSortingChange: typeof setSorting = (updater) => {
    setSorting(updater);
    if (cursorMode) resetCursor();
  };

  useImperativeHandle(actionRef, () => ({ reload: doReload, clearSelection }), [managed]);

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

  // 解析最终数据 / 分页 / loading（托管 vs 展示）。
  const tableData = managed ? fetched.data : (dataProp ?? []);
  const loading = managed ? fetching : loadingProp;
  // cursor 模式不走数字分页（keyset 无 total/随机跳页），由专属 footer 渲染。
  const pagination = cursorMode
    ? undefined
    : managed
    ? {
        page,
        pageSize,
        total: fetched.total,
        onPageChange: setPage,
        onPageSizeChange: (size: number) => {
          setPageSize(size);
          setPage(1); // 切每页条数回到第 1 页，避免落在超出新总页数的页码上
        },
      }
    : paginationProp;

  // 选中行 key 集合（批量条用）。
  const selectedRowKeys = useMemo(
    () =>
      Object.keys(rowSelection ?? {}).filter((k) => (rowSelection as RowSelectionState)[k]),
    [rowSelection],
  );
  const showBatch = batchActions != null && selectedRowKeys.length > 0;

  const reloadVisible = features?.reload && (managed || onReload != null);

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        // 列表页旗舰：整体即一张浮起卡片（表面 + 发丝边 + 阴影），与 Card 同层级。
        !fullscreen && "rounded-[var(--radius)] border border-hairline bg-surface p-4 shadow-sm",
        fullscreen && "fixed inset-0 z-50 overflow-auto bg-bg p-6",
        rootClassName,
      )}
    >
      {search && (
        <SearchForm
          {...search}
          className={cn("m-0", search.className)}
          loading={managed ? fetching : search.loading}
          onSearch={(values) => {
            if (managed) {
              setFilters(values);
              setPage(1);
              if (cursorMode) resetCursor();
            }
            search.onSearch?.(values);
          }}
          onReset={(values) => {
            if (managed) {
              setFilters(values);
              setPage(1);
              if (cursorMode) resetCursor();
            }
            search.onReset?.(values);
          }}
        />
      )}

      {showToolbar && (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 truncate text-base font-medium text-foreground">{title}</div>
          <div className="flex shrink-0 items-center gap-1.5">
            {toolbarActions}
            {toolbarActions != null &&
              (features?.reload || features?.density || features?.columnSetting || features?.fullscreen) && (
                <span className="mx-0.5 h-4 w-px bg-border" aria-hidden />
              )}
            {reloadVisible && (
              <button type="button" aria-label={t.reload} onClick={doReload} className={iconBtn}>
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

      {showBatch && (
        <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius)] border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
          <span className="text-foreground">{t.selected(selectedRowKeys.length)}</span>
          <button
            type="button"
            onClick={clearSelection}
            className="text-muted underline-offset-2 transition-colors hover:text-foreground hover:underline"
          >
            {t.clearSelection}
          </button>
          <div className="ml-auto flex items-center gap-2">
            {batchActions!({ selectedRowKeys, clearSelection })}
          </div>
        </div>
      )}

      <div className="relative">
        <Table<TData>
          columns={visibleColumns}
          data={tableData}
          density={density}
          bordered={false}
          className={className}
          enableRowSelection={enableRowSelection}
          rowSelection={rowSelection}
          onRowSelectionChange={setSelection}
          sorting={managed ? sorting : sortingProp}
          onSortingChange={managed ? handleSortingChange : onSortingChange}
          getRowId={getRowId}
          {...tableProps}
        />
        {loading && (
          <div className="absolute inset-0 z-10 grid place-items-center rounded-[var(--radius)] bg-surface/60">
            <Spin />
          </div>
        )}
      </div>

      {pagination && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted">{t.total(pagination.total)}</span>
          <div className="flex flex-wrap items-center gap-3">
            {pageSizeOptions != null &&
              pageSizeOptions.length > 0 &&
              pagination.onPageSizeChange != null && (
                <Select
                  items={pageSizeOptions.map((n) => ({ value: String(n), label: t.pageSize(n) }))}
                  value={String(pagination.pageSize)}
                  onValueChange={(v) => pagination.onPageSizeChange!(Number(v))}
                >
                  <SelectTrigger size="sm" aria-label={t.pageSize(pagination.pageSize)} className="w-28" />
                  <SelectContent>
                    {pageSizeOptions.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {t.pageSize(n)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            <Pagination
              page={pagination.page}
              total={Math.max(1, Math.ceil(pagination.total / pagination.pageSize))}
              onPageChange={pagination.onPageChange}
              showFirstLast={pagination.showFirstLast ?? true}
            />
          </div>
        </div>
      )}

      {cursorMode && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {pageSizeOptions != null && pageSizeOptions.length > 0 && (
            <Select
              items={pageSizeOptions.map((n) => ({ value: String(n), label: t.pageSize(n) }))}
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                resetCursor(); // 换页长回到第 1 页：旧游标对应的页边界已失效
              }}
            >
              <SelectTrigger size="sm" aria-label={t.pageSize(pageSize)} className="w-28" />
              <SelectContent>
                {pageSizeOptions.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {t.pageSize(n)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={cursorStack.length <= 1 || fetching}
              onClick={() => setCursorStack((s) => (s.length > 1 ? s.slice(0, -1) : s))}
            >
              {t.prevPage}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!fetched.hasMore || fetched.nextCursor == null || fetching}
              onClick={() =>
                setCursorStack((s) =>
                  fetched.nextCursor == null ? s : [...s, fetched.nextCursor],
                )
              }
            >
              {t.nextPage}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
