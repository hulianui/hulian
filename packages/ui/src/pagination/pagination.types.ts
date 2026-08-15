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
  /**
   * 每页条数候选档（对标 el-pagination 的 `page-sizes`）。**与 `onPageSizeChange` 同传才渲染切换器**
   * ——组件不自持 `pageSize`，只给档而不给回调等于切了没人收，故两者缺一即静默不渲染。
   */
  pageSizeOptions?: number[];
  /**
   * 每页条数变更回调。
   *
   * 换页长之后当前页可能已经超出新的总页数（100/页的第 3 页，切回 20/页时第 3 页还在，
   * 但 5151 条 / 100 的第 52 页切到 20/页就没有第 52 页了）。**这一夹紧由组件负责**：
   * 给了 `totalItems` 时，组件按新页长重算总页数，若当前页越界则**再补发一次 `onPageChange`**
   * （夹到新的末页，而不是回第 1 页 —— 用户的位置尽量保住）。所以一次切档最多触发两个回调，
   * 消费方两个 setState 都照常写即可，React 会批到同一次渲染。
   *
   * 只给了 `total`（总页数）时算不出新页数，组件**不**补发 `onPageChange`，页码归位由消费方自理。
   */
  onPageSizeChange?: (pageSize: number) => void;
  /** 禁用整个分页器 */
  disabled?: boolean;
}
