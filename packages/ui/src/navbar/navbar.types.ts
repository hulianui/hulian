import type { HTMLAttributes, ReactNode } from "react";

/** 宽屏横排导航出现的断点：折叠按钮与折叠菜单在这一档起隐藏。 */
export type NavbarBreakpoint = "sm" | "md" | "lg" | "xl";

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  /** 是否 sticky 吸顶。 */
  sticky?: boolean;
  /** 是否显示底部分隔边框。 */
  bordered?: boolean;
  /** 高度档：`md` 64px（中后台），`sm` 56px（文档 / 营销站的紧凑顶栏，左右内距同步收一档）。@default "md" */
  size?: "md" | "sm";
  /**
   * 底色：`surface` 卡面色半透明（顶栏是浮在内容上的面板）；
   * `page` 页面底色半透明 + 更淡的分隔线（顶栏融进页面）。两档都带背景模糊。
   * @default "surface"
   */
  variant?: "surface" | "page";
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
  /**
   * `text`：只变文字色（默认）。`soft`：选中项铺主色浅底、悬停铺中性浅底；
   * 项里直接放链接时内距挪到链接上，整块都是点击区。
   * @default "text"
   */
  variant?: "text" | "soft";
  children?: ReactNode;
}

export interface NavbarMenuToggleProps {
  /** 受控展开态。 */
  isOpen?: boolean;
  onToggle?: () => void;
  /** 无障碍标签（默认按 isOpen 切换）。 */
  "aria-label"?: string;
  /** 从这一档断点起隐藏（宽屏横排导航接手）。@default "sm" */
  breakpoint?: NavbarBreakpoint;
  className?: string;
}

export interface NavbarMenuProps extends HTMLAttributes<HTMLUListElement> {
  /** 是否展开；收起时不渲染（菜单里的链接不会在收起态被 Tab 到）。 */
  isOpen?: boolean;
  /** 从这一档断点起隐藏，与 `NavbarMenuToggle` 取同一档。@default "sm" */
  breakpoint?: NavbarBreakpoint;
  children?: ReactNode;
}
