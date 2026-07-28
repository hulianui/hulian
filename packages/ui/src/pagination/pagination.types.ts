import type { HTMLAttributes, ReactNode } from "react";

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** 当前页（1 起），受控 */
  page: number;
  /**
   * **总页数**（注意不是总条数）。与 `totalItems` 二选一，同传时以本项为准。
   *
   * 后端分页接口通常回的是总条数，此时走 `totalItems` + `pageSize` 那条路，别在调用处自己
   * `Math.ceil` —— 两处各算一遍最容易在边界（0 条 / 整除）上分叉。
   */
  total?: number;
  /** **总条数**（后端 `data.total` 的常见语义）。与 `pageSize` 同传，内部算出页数。 */
  totalItems?: number;
  /** 每页条数，仅在给了 `totalItems` 时参与算页数，默认 10。 */
  pageSize?: number;
  /** 页码变更回调（点击页码/上下页/首末页时触发，已夹紧到 [1,总页数]） */
  onPageChange: (page: number) => void;
  /** 当前页左右各显示的页码数，默认 1 */
  siblingCount?: number;
  /** 是否显示「跳到首页/末页」按钮，默认 false */
  showFirstLast?: boolean;
  /**
   * 左侧总数文案（如「共 128 条」）。传函数可自定义，入参是总条数与当前页的条目区间。
   * **依赖 `totalItems`**：只给了 `total`（页数）时算不出条数，本项静默不渲染。
   */
  showTotal?: boolean | ((totalItems: number, range: [number, number]) => ReactNode);
  /** 右侧「跳至 __ 页」快捷跳转框，默认 false */
  showQuickJumper?: boolean;
  /** 禁用整个分页器 */
  disabled?: boolean;
}
