import type { HTMLAttributes, ReactElement, ReactNode } from "react";

export interface BreadcrumbItem {
  /** 显示内容 */
  label: ReactNode;
  /** 链接地址；省略则该项不可点（当前页或不可导航的祖先） */
  href?: string;
  /** 显式标记为当前页；默认数组末项即当前页 */
  current?: boolean;
  /**
   * 渲染为自定义元素（next/link、react-router 的 Link…），与 Button / Link / NavMenuItem /
   * SidebarMenuButton 的 `render` 同一口径：皮肤类名与 `aria-current` 合并进该元素，`label` 作它的
   * 子节点。真渲染成消费方给的元素而不是劫持点击，所以 Cmd+点击 / 中键 / Shift 这些原生行为照常。
   *
   * 传了它就以它为准：本项即使是当前页也仍渲染为该元素（只是带上 `aria-current="page"`），
   * 想保留「当前页不可点」就别给该项传 `render`。`href` 由该元素自带；若本项也写了 `href`，
   * 以本项的为准。
   *
   * @example { label: "客户", render: <Link href="/customers" /> }
   */
  render?: ReactElement;
}

export interface BreadcrumbProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** 路径项数组（从根到当前页，自左向右） */
  items: BreadcrumbItem[];
  /** 分隔符，默认 "/"；可换 chevron 等 ReactNode（装饰位，自动 aria-hidden） */
  separator?: ReactNode;
}
