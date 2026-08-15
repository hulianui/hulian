"use client";
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type { ColumnDef, RowSelectionState, SortingState } from "@tanstack/react-table";
import { Columns3, Maximize, Minimize, RefreshCw, Rows3 } from "../_icons";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { useLocaleValue } from "../config/locale-context";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { Pagination } from "../pagination/pagination";
import { PageSizeSelect } from "../pagination/pagination.page-size-select";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
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
  "inline-grid size-8 place-items-center rounded-[var(--radius)] text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";

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

const EMPTY_PARAMS: Record<string, unknown> = {};

// params 浅比较（键集合 + Object.is 逐值）。undefined 视同 {}。
// 只比第一层：这正是「内联对象字面量不触发重查、但嵌套对象换引用会触发」的边界。
function shallowEqualParams(
  a: Record<string, unknown> = EMPTY_PARAMS,
  b: Record<string, unknown> = EMPTY_PARAMS,
): boolean {
  if (a === b) return true;
  const ak = Object.keys(a);
  if (ak.length !== Object.keys(b).length) return false;
  return ak.every((k) => Object.prototype.hasOwnProperty.call(b, k) && Object.is(a[k], b[k]));
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
    params,
    onRequestError,
    paginationMode = "page",
    defaultPageSize = 10,
    defaultSorting,
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
    // 列显隐（受控出口 · #236）
    columnVisibility: columnVisibilityProp,
    onColumnVisibilityChange,
    ...tableProps
  } = props;

  const t = useLocaleValue("proTable", {
    total: (n) => `共 ${n} 条`,
    reload: "刷新",
    density: "密度",
    densityValue: (density) => `密度：${density}`,
    columnSetting: "列设置",
    fullscreen: "全屏",
    exitFullscreen: "退出全屏",
    columnsTitle: "列展示",
    selected: (n) => `已选 ${n} 项`,
    clearSelection: "清空",
    pageSize: (n) => `${n} 条/页`,
    pageSizeLabel: "每页条数",
    prevPage: "上一页",
    nextPage: "下一页",
  });
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
  const [fullscreen, setFullscreen] = useState(false);

  // —— 列显隐（#236）——
  // 受控/非受控与 rowSelection 同一判据：传了 columnVisibility 就是消费方接管。
  // 映射口径是「缺省即可见」，所以落库的偏好只需要记被关掉的那几列也能还原。
  const controlledVisibility = columnVisibilityProp != null;
  const [internalVisibility, setInternalVisibility] = useState<Record<string, boolean>>({});
  const columnVisibility = controlledVisibility ? columnVisibilityProp : internalVisibility;
  if (controlledVisibility && onColumnVisibilityChange == null) {
    // 受控但没给出口 = 列设置点不动，且和「组件坏了」长得一模一样（同 rowSelection 那条）。
    warnOnce(
      "pro-table/controlled-column-visibility-without-handler",
      "[hulian] ProTable：传了 columnVisibility 却没传 onColumnVisibilityChange，列显隐将无法变更。要内部自持就别传 columnVisibility。",
    );
  }
  const applyVisibility = (next: Record<string, boolean>) => {
    if (controlledVisibility) onColumnVisibilityChange?.(next);
    else setInternalVisibility(next);
  };
  // 锁定列（meta.lockVisible）恒可见：锁的语义是「这列不给关」，所以一份旧的落库偏好
  // 也不能把身份列/操作列关掉 —— 否则界面上根本没有打开它的入口。
  const isLocked = (c: ColumnDef<TData, any>) => c.meta?.lockVisible === true;
  const isColVisible = (c: ColumnDef<TData, any>) =>
    isLocked(c) || columnVisibility[colId(c)] !== false;

  // —— 托管模式状态 ——
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  // defaultSorting 只做首次挂载初值（非受控默认值语义），之后由用户点表头接管。
  const [sorting, setSorting] = useState<SortingState>(defaultSorting ?? []);
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
  // 防呆（不是可选优化）：request 同样只用 ref 持有最新引用，effect 依赖里不放它。
  // 否则消费者写内联 `request={async (p) => …}`（每次 render 新身份）会让拉数 effect
  // 每次 render 重跑 → setState → 再 render → 无限请求打爆服务端。
  // 代价：换 request 函数本身不触发重查（改 params 或 actionRef.reload()）。
  const requestRef = useRef(request);
  requestRef.current = request;
  // cursor 模式游标栈：stack[i] = 第 i+1 页的入参 cursor（第 1 页恒为 null）。
  // 上一页 = 弹栈；filters/sort/pageSize 变化 = 重置为 [null]（旧游标钉死了
  // 签发时的排序/筛选语义，跨条件复用会拿到错页或被服务端 422）。
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const resetCursor = () => setCursorStack([null]);

  // —— params（固定查询参数）浅比较 ——
  // 用「渲染期派生 state」而不是 useEffect：新 params 与 page=1 在同一次提交里生效，
  // 拉数 effect 只跑一次；若放 effect 里 setPage 会先用旧页码发一次废请求再纠正。
  // version 而不是 JSON.stringify 做 effect 依赖：浅比较不关心键序，值也可能不可序列化。
  const [paramsState, setParamsState] = useState({ value: params, version: 0 });
  if (!shallowEqualParams(paramsState.value, params)) {
    setParamsState((s) => ({ value: params, version: s.version + 1 }));
    if (managed) {
      setPage(1); // 固定条件变了，旧页码的结果集已无意义
      if (cursorMode) setCursorStack([null]);
    }
  }
  const paramsVersion = paramsState.version;

  // 行选择：判据是「消费方有没有接管」，不是「是不是托管模式」（#202）。
  //
  // 旧口径下托管模式一律自持，传进来的 rowSelection / onRowSelectionChange 被直接丢弃且无任何
  // 告警——页面上勾得动、表头全选框也会变半选，看起来完全正常，但消费方的 state 恒为 {}，
  // 直到提交时拿到空数组才暴露。tsc、guard、控制台全都发现不了。
  //
  // 现在与 sorting 同一套约定：传了就受控，没传才内部自持（托管拉数与批量条都只需要能**读到**
  // 选中集合，读 rowSelection 这个统一出口即可，不必非得由本层持有）。
  const controlledSelection = rowSelectionProp != null;
  const [internalSelection, setInternalSelection] = useState<RowSelectionState>({});
  const rowSelection = controlledSelection ? rowSelectionProp : internalSelection;
  const setSelection = controlledSelection ? onRowSelectionChange : setInternalSelection;
  if (controlledSelection && onRowSelectionChange == null) {
    // 受控但没给出口 = 勾不动，且和「组件坏了」长得一模一样。
    warnOnce(
      "pro-table/controlled-selection-without-handler",
      "[hulian] ProTable：传了 rowSelection 却没传 onRowSelectionChange，选择态将无法变更。要内部自持选择就别传 rowSelection。",
    );
  }

  const sortParam = useMemo(() => toProSort(sorting), [sorting]);
  const filtersKey = JSON.stringify(filters);
  // cursor 模式下驱动拉数的键（page 模式恒空串，不触发多余请求）。
  const cursorKey = cursorMode
    ? `${cursorStack.length}:${cursorStack[cursorStack.length - 1] ?? ""}`
    : "";

  // 托管模式拉数（竞态守卫：只接受最新一次 seq 的结果）。
  useEffect(() => {
    const send = requestRef.current;
    if (!send) return;
    const seq = ++reqSeq.current;
    setFetching(true);
    const reqParams: ProTableRequestParams = cursorMode
      ? {
          page: cursorStack.length,
          pageSize,
          sort: sortParam,
          filters,
          params: params ?? EMPTY_PARAMS,
          cursor: cursorStack[cursorStack.length - 1],
        }
      : { page, pageSize, sort: sortParam, filters, params: params ?? EMPTY_PARAMS };
    send(reqParams)
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
    // filters 用 filtersKey 稳定依赖；sortParam 已 memo；cursor 栈用 cursorKey 稳定依赖；
    // params 用 paramsVersion（浅比较后自增）稳定依赖；request 走 requestRef 不进依赖，
    // 只用 managed（有没有 request）驱动「展示模式 → 托管模式」的首拉。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managed, page, pageSize, sortParam, filtersKey, reloadKey, cursorKey, paramsVersion]);

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
    // 判据与 isColVisible 同源，这里内联是为了让 memo 的依赖只有 columns / columnVisibility
    () => columns.filter((c) => c.meta?.lockVisible === true || columnVisibility[colId(c)] !== false),
    [columns, columnVisibility],
  );

  const cycleDensity = () =>
    setDensity((d) => DENSITY_ORDER[(DENSITY_ORDER.indexOf(d) + 1) % DENSITY_ORDER.length]);

  const toggleCol = (c: ColumnDef<TData, any>) => {
    if (isLocked(c)) return; // 锁定列的勾选框已置灰，这里是第二道闸（键盘/程序化点击）
    const id = colId(c);
    const nextVisible = !isColVisible(c);
    // 保底：不允许隐藏最后一列可见列，避免空表头
    if (!nextVisible && visibleColumns.length <= 1) return;
    applyVisibility({ ...columnVisibility, [id]: nextVisible });
  };

  const showToolbar = features !== null || title != null || toolbarActions != null;

  // 解析最终数据 / 分页 / loading（托管 vs 展示）。
  const tableData = managed ? fetched.data : dataProp ?? [];
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
    () => Object.keys(rowSelection ?? {}).filter((k) => (rowSelection as RowSelectionState)[k]),
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
              (features?.reload ||
                features?.density ||
                features?.columnSetting ||
                features?.fullscreen) && <span className="mx-0.5 h-4 w-px bg-border" aria-hidden />}
            {reloadVisible && (
              <button type="button" aria-label={t.reload} onClick={doReload} className={iconBtn}>
                <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              </button>
            )}
            {features?.density && (
              <button
                type="button"
                aria-label={t.densityValue(density)}
                title={t.densityValue(density)}
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
                      // 锁定列（#236）：置灰 + 恒选中。「这两列不给关」在全量开关里表达不了，
                      // 而关掉身份列/操作列的那一行就既没有身份也没有出口。
                      const locked = isLocked(c);
                      return (
                        <label
                          key={id}
                          className={cn(
                            "flex items-center gap-2 text-sm",
                            locked ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                          )}
                        >
                          <Checkbox
                            checked={isColVisible(c)}
                            disabled={locked}
                            onCheckedChange={() => toggleCol(c)}
                          />
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
            className="text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
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
          <span className="text-sm text-muted-foreground">{t.total(pagination.total)}</span>
          <div className="flex flex-wrap items-center gap-3">
            {/* 切换器与 Pagination 的 pageSizeOptions（#271）共用同一份皮肤（PageSizeSelect），
                改一次两处同步。这里没有把它交给 Pagination 内部渲染：ProTable 的底栏是
                「左总数 / 右工具」的两列版式，切换器归右列的 gap-3，与分页器的 gap-1.5 不是一档。 */}
            {pageSizeOptions != null &&
              pageSizeOptions.length > 0 &&
              pagination.onPageSizeChange != null && (
                <PageSizeSelect
                  options={pageSizeOptions}
                  value={pagination.pageSize}
                  onChange={(n) => pagination.onPageSizeChange!(n)}
                  label={t.pageSize}
                  ariaLabel={t.pageSizeLabel}
                />
              )}
            {/* pagination.total 是总条数，直接喂 Pagination 的 totalItems（0.11.0 起），
                不再在这里手算 Math.ceil —— 页数换算只留一处，边界（0 条 / 整除）不会两边各算各的。 */}
            <Pagination
              page={pagination.page}
              totalItems={pagination.total}
              pageSize={pagination.pageSize}
              onPageChange={pagination.onPageChange}
              showFirstLast={pagination.showFirstLast ?? true}
            />
          </div>
        </div>
      )}

      {cursorMode && (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {pageSizeOptions != null && pageSizeOptions.length > 0 && (
            <PageSizeSelect
              options={pageSizeOptions}
              value={pageSize}
              onChange={(n) => {
                setPageSize(n);
                resetCursor(); // 换页长回到第 1 页：旧游标对应的页边界已失效
              }}
              label={t.pageSize}
              ariaLabel={t.pageSizeLabel}
            />
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
                setCursorStack((s) => (fetched.nextCursor == null ? s : [...s, fetched.nextCursor]))
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
