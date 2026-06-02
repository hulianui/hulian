import type { MouseEventHandler, ReactNode } from "react";

export interface MenuContentProps {
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}

export interface MenuItemProps {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  /** 点击后是否关闭菜单。@default true */
  closeOnClick?: boolean;
  /** 类型筛选用文案覆盖（键盘 type-ahead）。 */
  label?: string;
  variant?: "default" | "danger";
  className?: string;
}
