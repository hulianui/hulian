import type { CSSProperties, ReactNode } from "react";

/** 菜单条目 */
export interface StaggeredMenuItem {
  /** 条目文案（大号标题） */
  label: string;
  /** 跳转链接，缺省渲染为不可跳转的 span */
  link?: string;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/** 社交链接条目 */
export interface StaggeredMenuSocial {
  /** 社交平台文案 */
  label: string;
  /** 外链地址 */
  link: string;
}

export interface StaggeredMenuProps {
  /**
   * 面板滑出方向，默认 "right"（右侧滑入）。
   * "left" 时面板与色层从左侧滑入。
   */
  position?: "left" | "right";
  /**
   * 面板背后的多层「色层」颜色（错峰滑入，营造叠纸质感），最多取前 4 个。
   * 建议用瑚琏 token：["var(--color-chart-1)", "var(--color-chart-2)"]。
   * 默认取 chart-4 / chart-1 两层（吃明暗主题）。
   */
  colors?: string[];
  /**
   * 菜单主条目列表。空数组时渲染占位「No items」。
   */
  items?: StaggeredMenuItem[];
  /**
   * 社交链接列表，配合 displaySocials 在面板底部展示。
   */
  socialItems?: StaggeredMenuSocial[];
  /**
   * 是否展示底部社交区，默认 true（仅当 socialItems 非空才实际渲染）。
   */
  displaySocials?: boolean;
  /**
   * 是否给主条目展示前缀序号（01 / 02 …），默认 true。
   */
  displayItemNumbering?: boolean;
  /**
   * 触发按钮旁的品牌槽（通常放 logo 文字或图标），缺省渲染默认文字「瑚琏」。
   */
  brand?: ReactNode;
  /**
   * 强调色（序号、社交标题、条目 hover），缺省走瑚琏 var(--color-primary)。
   */
  accentColor?: string;
  /**
   * 是否 fixed 铺满视口（整页导航罩层），默认 false（相对父容器铺满）。
   */
  isFixed?: boolean;
  /**
   * 点击面板外区域是否关闭，默认 true。
   */
  closeOnClickAway?: boolean;
  /** 菜单打开回调 */
  onMenuOpen?: () => void;
  /** 菜单关闭回调 */
  onMenuClose?: () => void;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
