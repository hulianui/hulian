import type { AnchorHTMLAttributes, ReactElement, ReactNode } from "react";

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color"> {
  tone?: "primary" | "foreground" | "danger";
  underline?: "always" | "hover" | "none";
  /** 外链：加 target=_blank + rel=noopener noreferrer + 尾随外链图标。 */
  external?: boolean;
  /**
   * 渲染为自定义元素，承载路由跳转件：`<Link render={<NextLink href="/a" />}>去 A</Link>`。
   * 皮肤 className 与 Link 自身的 props 合并进该元素，`href` 之类由它自己带。
   * 不给这个口子时 Link 就是纯 `<a>`（可 RSC）。
   */
  render?: ReactElement;
  children?: ReactNode;
}
