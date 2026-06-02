import type { HTMLAttributes } from "react";

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** 当前页（1 起），受控 */
  page: number;
  /** 总页数 */
  total: number;
  /** 页码变更回调（点击页码/上下页/首末页时触发，已夹紧到 [1,total]） */
  onPageChange: (page: number) => void;
  /** 当前页左右各显示的页码数，默认 1 */
  siblingCount?: number;
  /** 是否显示「跳到首页/末页」按钮，默认 false */
  showFirstLast?: boolean;
  /** 禁用整个分页器 */
  disabled?: boolean;
}
