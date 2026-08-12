import type { ReactNode, Ref } from "react";
import type { SortingState } from "@tanstack/react-table";
import type { TableProps } from "../table/table.types";
import type { SearchFormProps } from "../search-form/search-form.types";

/** 内置工具栏功能开关（默认全开）。 */
export interface ProTableToolbarFeatures {
  /** 刷新按钮（触发 onReload）。 */
  reload?: boolean;
  /** 密度切换（default → middle → compact 循环）。 */
  density?: boolean;
  /** 列设置（勾选显隐列）。 */
  columnSetting?: boolean;
  /** 全屏切换。 */
  fullscreen?: boolean;
}

/** 集成分页（底部）。total 为「总条数」，组件内部换算总页数。 */
export interface ProTablePagination {
  /** 当前页（1 起）。 */
  page: number;
  /** 每页条数。 */
  pageSize: number;
  /** 总条数。 */
  total: number;
  onPageChange: (page: number) => void;
  /** 显示首/末页按钮，默认 true。 */
  showFirstLast?: boolean;
  /** 每页条数变化（展示模式下与 pageSizeOptions 搭配才显示切换器）。 */
  onPageSizeChange?: (pageSize: number) => void;
}

/** 服务端排序参数（单列）。 */
export interface ProTableSort {
  field: string;
  order: "asc" | "desc";
}

/** 托管分页协议：page=页码分页（默认）；cursor=游标分页（上一页/下一页导航，无 total）。 */
export type ProTablePaginationMode = "page" | "cursor";

/** 托管模式 request 入参：分页 + 排序 + 查询区筛选值 + 固定查询参数。 */
export interface ProTableRequestParams {
  page: number;
  pageSize: number;
  sort: ProTableSort | null;
  /** 查询区（SearchForm）提交的筛选值。不含 params。 */
  filters: Record<string, unknown>;
  /**
   * 固定查询参数：原样透传 ProTable 的 `params` prop（未传时为 `{}`）。
   * 刻意与 filters 分开：params 是页面上下文钉死的条件（如 `{ scopeId }`），
   * 不受查询区重置影响，也不会被同名 filter 覆盖。request 里自行合并：
   * `api.list({ ...p.filters, ...p.params })`。
   * 类型上可选是为了向后兼容（旧代码可能手工构造本类型），运行时恒有值。
   */
  params?: Record<string, unknown>;
  /**
   * cursor 模式：本页入参游标（第 1 页恒为 null）。
   * page 模式不携带此字段（undefined）。
   */
  cursor?: string | null;
}

/** 托管模式 request 返回：当前页数据 + 分页元信息。 */
export interface ProTableRequestResult<TData> {
  data: TData[];
  /** 总条数。page 模式必须返回（驱动页码计算）；cursor 模式可省略。 */
  total?: number;
  /** cursor 模式：下一页游标（null/缺省 = 无下一页）。page 模式忽略。 */
  nextCursor?: string | null;
  /** cursor 模式：是否还有下一页。缺省时按 `nextCursor != null` 推断。 */
  hasMore?: boolean;
}

/** actionRef 命令式句柄。 */
export interface ProTableActions {
  /** 用当前 page/sort/filters 重新请求。 */
  reload: () => void;
  /** 清空行选择。 */
  clearSelection: () => void;
}

/** 批量操作区渲染上下文。 */
export interface ProTableBatchCtx {
  /** 选中行 key（来自 getRowId）。 */
  selectedRowKeys: string[];
  /** 清空选择。 */
  clearSelection: () => void;
}

export interface ProTableProps<TData> extends Omit<TableProps<TData>, "data"> {
  /** 表格数据（展示模式必传；托管模式由 request 提供，忽略此项）。 */
  data?: TData[];
  /** 卡片标题（工具栏左侧）。 */
  title?: ReactNode;
  /** 工具栏右侧自定义操作（新增按钮等），位于内置图标按钮左侧。 */
  toolbarActions?: ReactNode;
  /** 内置工具栏：true=全开（默认）/ false=不渲染工具栏 / 对象=逐项开关。 */
  toolbar?: boolean | ProTableToolbarFeatures;
  /**
   * 集成查询区（复用 SearchForm）。不传则不渲染。
   * onSearch 在此可选（运行时本就可缺省）：托管模式由 ProTable 接管 filters/翻页，
   * 消费者无需再写 noop onSearch。
   */
  search?: Omit<SearchFormProps, "onSearch"> & { onSearch?: SearchFormProps["onSearch"] };
  /** 刷新回调（点击工具栏刷新图标触发）。 */
  onReload?: () => void;
  /** 加载态：刷新图标旋转。 */
  loading?: boolean;
  /** 集成分页（底部）。不传则不渲染。 */
  pagination?: ProTablePagination;
  /** 外层容器 className（区别 tableClassName 透传给内部 Table）。 */
  rootClassName?: string;
  /**
   * 服务端受控数据源。提供则进入「托管模式」：ProTable 自管
   * page/pageSize/sort/filters/loading/data/选择 生命周期，按需调 request；
   * 此时忽略 data/pagination/loading props。不提供则维持现有展示模式。
   *
   * 内部以 ref 持有最新引用，**不进请求依赖**：即使消费者写内联箭头函数
   * （每次 render 新身份）也不会自激死循环。代价是「换一个 request 函数」
   * 本身不触发重查——要换数据源请改 params 或调 actionRef.reload()。
   */
  request?: (params: ProTableRequestParams) => Promise<ProTableRequestResult<TData>>;
  /**
   * 固定查询参数（托管模式）。与查询区 filters 并列传给 request 的 `params` 字段，
   * 用于承载页面上下文钉死的条件（路由 id、外部筛选器、tab 值等）。
   *
   * 采用**浅比较**（键集合 + Object.is 逐值）：内容变化才回第 1 页重新 request，
   * 只是引用变化（内联对象字面量）不会触发。因此可以直接写
   * `params={{ scopeId }}`，无需 useMemo。
   * 注意浅比较只看第一层——嵌套对象/数组请自己保持引用稳定，否则每次 render 都会重查。
   * 展示模式忽略此项。
   */
  params?: Record<string, unknown>;
  /**
   * 托管模式分页协议。"page"（默认）：request 返回 `{ data, total }`，底部渲染
   * 总条数文案 + 数字分页。"cursor"：request 入参带 `cursor`、返回
   * `{ data, nextCursor, hasMore }`，底部渲染「上一页/下一页」按钮对（keyset
   * 分页无 total/随机跳页）；组件内维护游标栈支持上一页回退，
   * filters/sort/pageSize 任一变化自动重置回第 1 页。展示模式忽略此项。
   * @default "page"
   */
  paginationMode?: ProTablePaginationMode;
  /**
   * 托管模式 request 失败回调（page / cursor 两种分页协议均生效）。
   * 失败时 loading 复位、保留上一次成功数据；不传则默认 `console.error`，
   * 保证 rejection 不会变成 unhandled。消费者可在此弹 toast / 上报。
   */
  onRequestError?: (error: unknown) => void;
  /** 托管模式初始每页条数。@default 10 */
  defaultPageSize?: number;
  /**
   * 托管模式初始排序（非受控默认值）。仅作内部排序 state 的 **首次挂载初值**，
   * 之后由用户点表头接管；后续改这个 prop 不会回灌（同 defaultValue 家族语义）。
   * 首次 request 即带上它，因此「默认按某列倒序」可直接表达：
   * `defaultSorting={[{ id: "weight", desc: true }]}`。
   *
   * 不改变受控语义：展示模式仍由 `sorting` + `onSortingChange` 受控，此项不生效
   * （展示模式的默认排序请直接传 `sorting`）。
   */
  defaultSorting?: SortingState;
  /**
   * 每页条数可选项（如 [10, 20, 50, 100]）。提供则在分页区渲染「每页条数」切换器：
   * 托管模式由 ProTable 自管 pageSize（切换后回到第 1 页并重新 request）；
   * 展示模式需配合 pagination.onPageSizeChange 受控。
   */
  pageSizeOptions?: number[];
  /** 命令式句柄：reload() 重新请求 / clearSelection() 清空选择。 */
  actionRef?: Ref<ProTableActions>;
  /** 选中行时渲染的批量操作区（需 enableRowSelection + 有选中才显示警示条）。 */
  batchActions?: (ctx: ProTableBatchCtx) => ReactNode;
  /**
   * 受控列显隐（#236）：`列 id → 是否可见`，**缺省的键视为可见**。
   * 与 `rowSelection` / `sorting` 同一口径 —— 传了就受控（必须配 `onColumnVisibilityChange`），
   * 不传才内部自持。
   *
   * 存在的理由是列偏好要能落库：内部 useState 下工具栏点得动、刷新就没了，
   * 「同一个运营换台机器，列偏好跟人走」这件事在组件外一行都写不了。
   *
   * 列 id 的口径同 `ColumnDef`：`id` 优先，没有则取 `accessorKey`。
   * 带 `meta.lockVisible` 的列恒可见，对它写 `false` 不生效。
   */
  columnVisibility?: Record<string, boolean>;
  /**
   * 列显隐变化（#236）。回传的是**完整的下一份**可见性映射（不是 patch），
   * 直接落 localStorage / PATCH 回服务端即可。
   */
  onColumnVisibilityChange?: (next: Record<string, boolean>) => void;
}
