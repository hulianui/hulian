import type { HTMLAttributes, ReactNode } from "react";

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  /** 是否 sticky 吸顶。 */
  sticky?: boolean;
  /** 是否显示底部分隔边框。 */
  bordered?: boolean;
  children?: ReactNode;
}

export interface NavbarContentProps extends HTMLAttributes<HTMLUListElement> {
  /** 内容对齐方向。 */
  justify?: "start" | "center" | "end";
  children?: ReactNode;
}

export interface NavbarItemProps extends HTMLAttributes<HTMLLIElement> {
  /** 当前激活项（aria-current + 高亮）。 */
  isActive?: boolean;
  children?: ReactNode;
}

export interface NavbarMenuToggleProps {
  /** 受控展开态。 */
  isOpen?: boolean;
  onToggle?: () => void;
  /** 无障碍标签（默认按 isOpen 切换）。 */
  "aria-label"?: string;
  className?: string;
}
