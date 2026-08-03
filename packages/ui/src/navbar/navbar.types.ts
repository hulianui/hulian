import type { HTMLAttributes, ReactNode } from "react";

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  /** 是否 sticky 吸顶。 */
  sticky?: boolean;
  /** 是否显示底部分隔边框。 */
  bordered?: boolean;
  children?: ReactNode;
}

export interface NavbarBrandProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 品牌段是否与两侧 `NavbarContent` 等分空间（`flex-1 basis-0`），默认 `true`。
   * 三段等分是 `NavbarContent justify="center"` **真的落在导航栏中心**的前提：
   * 品牌段若定宽，居中段只会居中在「自己那一格」，整体随品牌名长度左偏。
   * 品牌内容仍靠 `justify-start` 贴左，且 flex 项默认 `min-width:auto` 不会被压小，
   * 所以看起来没有变化。
   *
   * 传 `false` 回到定宽（`shrink-0`）：**只有两段（品牌 + 一段紧贴品牌的 `justify="start"` 内容）
   * 的版式需要它** —— 那种版式下等分会把内容推到 1/3 处。
   */
  grow?: boolean;
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
