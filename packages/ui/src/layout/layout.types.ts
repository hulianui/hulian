import type { HTMLAttributes, ReactNode } from "react";

/** 触发收起/展开的来源：点底部折叠按钮 / 命中断点自动响应。 */
export type LayoutCollapseType = "clickTrigger" | "responsive";

/** 断点：Tailwind 默认像素名或自定义像素数（视口 ≤ 该宽度时自动收起 Sider）。 */
export type LayoutBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl" | number;

export interface LayoutProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 强制为「含侧栏」横向布局。默认自动探测：直接子元素含 Layout.Sider → 横向(row)，
   * 否则纵向(col，Header/Content/Footer 自上而下堆叠)。异步/条件渲染 Sider 时用它兜底。
   */
  hasSider?: boolean;
}

export interface LayoutHeaderProps extends HTMLAttributes<HTMLElement> {
  /** 吸顶（sticky top-0）。默认 false。 */
  sticky?: boolean;
}

export type LayoutContentProps = HTMLAttributes<HTMLElement>;

export type LayoutFooterProps = HTMLAttributes<HTMLElement>;

export interface LayoutSiderProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** 展开态宽度（px）。默认 240。 */
  width?: number;
  /** 收起态宽度（px）。默认 64（留出 icon-only 菜单）。 */
  collapsedWidth?: number;
  /** 是否可折叠（显示底部 trigger 折叠按钮）。默认 false。 */
  collapsible?: boolean;
  /** 受控收起态。传入即受控，须配合 onCollapse 回写。 */
  collapsed?: boolean;
  /** 非受控初始收起态。默认 false。 */
  defaultCollapsed?: boolean;
  /** 收起态变化回调（点 trigger 或命中断点时触发）。 */
  onCollapse?: (collapsed: boolean, type: LayoutCollapseType) => void;
  /** 响应式断点：视口 ≤ 该宽度时自动收起，> 时展开。 */
  breakpoint?: LayoutBreakpoint;
  /**
   * 底部折叠触发器内容。`undefined`=默认 chevron；`null`=不渲染触发器（即便 collapsible）；
   * 传 ReactNode=自定义触发器内容（仍由本件包裹为可点按钮）。
   */
  trigger?: ReactNode;
}
