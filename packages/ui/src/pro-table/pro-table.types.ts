import type { ReactNode } from "react";
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
}

export interface ProTableProps<TData> extends TableProps<TData> {
  /** 卡片标题（工具栏左侧）。 */
  title?: ReactNode;
  /** 工具栏右侧自定义操作（新增按钮等），位于内置图标按钮左侧。 */
  toolbarActions?: ReactNode;
  /** 内置工具栏：true=全开（默认）/ false=不渲染工具栏 / 对象=逐项开关。 */
  toolbar?: boolean | ProTableToolbarFeatures;
  /** 集成查询区（复用 SearchForm）。不传则不渲染。 */
  search?: SearchFormProps;
  /** 刷新回调（点击工具栏刷新图标触发）。 */
  onReload?: () => void;
  /** 加载态：刷新图标旋转。 */
  loading?: boolean;
  /** 集成分页（底部）。不传则不渲染。 */
  pagination?: ProTablePagination;
  /** 外层容器 className（区别 tableClassName 透传给内部 Table）。 */
  rootClassName?: string;
}
