import type { MouseEventHandler, ReactNode } from "react";

export interface ContextMenuContentProps {
  children: ReactNode;
  className?: string;
}

export interface ContextMenuItemProps {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  /** 点击后是否关闭菜单。@default true */
  closeOnClick?: boolean;
  /** 键盘 type-ahead 用文案覆盖。 */
  label?: string;
  variant?: "default" | "danger";
  className?: string;
}
