import type { ReactNode } from "react";

export interface DockProps {
  children?: ReactNode;
  /** 鼠标靠近时图标放大到的峰值尺寸(px)。 */
  magnification?: number;
  /** 影响范围半径(px)。 */
  distance?: number;
  /** 静息图标尺寸(px)。 */
  iconSize?: number;
  /**
   * 当前项的 key，与 `DockIcon` 的 `itemKey` 比对。
   *
   * 受控范式与 [NavMenu](../nav-menu/nav-menu.md) / [RouteTabs](../route-tabs/route-tabs.md) 一致：
   * 只在上层维护一个 key，不必让每个 `DockIcon` 各自算布尔值（那样消费方得自己维护
   * key → index 的映射）。单个图标仍可用 `DockIcon` 的 `active` 直接覆盖。
   */
  activeKey?: string;
  /**
   * 点击某一项。**提供它才会把 `DockIcon` 渲染成真正的 `<button>`**（可聚焦、可回车激活）；
   * 不提供时 `DockIcon` 保持无语义容器，由你自己往 children 里放链接或按钮。
   */
  onSelect?: (key: string) => void;
  /** 无障碍名。渲染为 `<nav>` 时作为地标名称。 */
  "aria-label"?: string;
  className?: string;
}

export interface DockIconProps {
  children?: ReactNode;
  /**
   * 本项的 key。配合 Dock 的 `activeKey` 判定选中，配合 `onSelect` 变成可点击项。
   */
  itemKey?: string;
  /**
   * 直接指定选中态，优先于 `activeKey` 比对结果。
   *
   * 选中态是 Dock 之所以是 Dock 的核心信息（macOS Dock 本身就有「当前应用高亮」与「运行中指示点」），
   * 不是装饰：Web 上 Dock 的典型用法是常驻底部导航，同样需要回答「我现在在哪」。
   * 缺它时屏幕阅读器用户完全拿不到当前位置——库里其它导航件都有选中态与对应语义，
   * Dock 曾是这一族里唯一的例外（#132）。
   */
  active?: boolean;
  /** 可点击时的无障碍名（图标本身通常没有文字）。 */
  label?: string;
  className?: string;
}
