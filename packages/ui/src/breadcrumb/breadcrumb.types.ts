import type { HTMLAttributes, ReactNode } from "react";

export interface BreadcrumbItem {
  /** 显示内容 */
  label: ReactNode;
  /** 链接地址；省略则该项不可点（当前页或不可导航的祖先） */
  href?: string;
  /** 显式标记为当前页；默认数组末项即当前页 */
  current?: boolean;
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** 路径项数组（从根到当前页，自左向右） */
  items: BreadcrumbItem[];
  /** 分隔符，默认 "/"；可换 chevron 等 ReactNode（装饰位，自动 aria-hidden） */
  separator?: ReactNode;
}
