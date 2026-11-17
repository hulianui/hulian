import type { AnchorHTMLAttributes, ReactElement, ReactNode } from "react";

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color"> {
  /** `muted`：静息次要灰、悬停回正文色，给页脚 / 一排来源链接这类不该抢主色的场景。@default "primary" */
  tone?: "primary" | "foreground" | "danger" | "muted";
  underline?: "always" | "hover" | "none";
  /** 外链：加 target=_blank + rel=noopener noreferrer + 尾随外链图标。 */
  external?: boolean;
  /** 尾随「前往」箭头，悬停时前移半格 ——「查看全部 →」这类导向链接。与 `external` 同时给时只出外链图标。 */
  arrow?: boolean;
  /**
   * 渲染为自定义元素，承载路由跳转件：`<Link render={<NextLink href="/a" />}>去 A</Link>`。
   * 皮肤 className 与 Link 自身的 props 合并进该元素，`href` 之类由它自己带。
   * 不给这个口子时 Link 就是纯 `<a>`（可 RSC）。
   */
  render?: ReactElement;
  children?: ReactNode;
}
