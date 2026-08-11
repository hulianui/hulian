import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";
import type { LayoutBreakpoint } from "../layout/layout.types";
import type { InputProps } from "../input/input.types";

/** 桌面端展开态。移动端不参与此态（移动端走抽屉的 `openMobile`）。 */
export type SidebarState = "expanded" | "collapsed";

/**
 * 桌面端折叠形态。
 *  · `offcanvas`：折叠即整条收走（宽度归零），要另外放一个 `SidebarTrigger` 在正文里才能开回来。
 *  · `icon`：折叠成只剩图标的窄条（宽度取 `--hl-sidebar-width-icon`），文字标签隐藏、靠 Tooltip 补说明。
 *  · `none`：不可折叠，恒为展开宽度（移动端仍然切抽屉）。
 */
export type SidebarCollapsible = "offcanvas" | "icon" | "none";

/** 贴哪一边。 */
export type SidebarSide = "left" | "right";

/** `useSidebar()` 的返回值。 */
export interface SidebarContextValue {
  /** 桌面端展开态的语义别名，等价于 `open ? "expanded" : "collapsed"`。 */
  state: SidebarState;
  /** 桌面端是否展开。 */
  open: boolean;
  /** 设置桌面端展开态（受控时只触发 `onOpenChange`）。 */
  setOpen: (open: boolean) => void;
  /** 移动端抽屉是否打开。 */
  openMobile: boolean;
  /** 设置移动端抽屉开关。 */
  setOpenMobile: (open: boolean) => void;
  /** 当前视口是否为移动端（由 `mobileBreakpoint` 决定；SSR / 首帧恒为 `false`）。 */
  isMobile: boolean;
  /** 按当前形态切换：移动端切抽屉，桌面端切展开态。 */
  toggleSidebar: () => void;
}

export interface SidebarProviderProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** 非受控初值。 */
  defaultOpen?: boolean;
  /** 受控展开态。传了就必须配 `onOpenChange`，持久化（cookie / localStorage）由消费方接。 */
  open?: boolean;
  /** 展开态变化回调（受控与非受控都会触发）。 */
  onOpenChange?: (open: boolean) => void;
  /** 移动端断点：视口宽度 **小于** 它即视为移动端并切抽屉。 */
  mobileBreakpoint?: LayoutBreakpoint;
  /** 内置快捷键的按键（与 Cmd/Ctrl 组合）。传 `false` 关掉内置快捷键。 */
  shortcutKey?: string | false;
  /** 展开宽度，写进 `--hl-sidebar-width`。任意 CSS 长度。 */
  width?: string;
  /** `collapsible="icon"` 的折叠宽度，写进 `--hl-sidebar-width-icon`。 */
  iconWidth?: string;
  /** 自钉视口高度（`h-dvh` + `overflow-hidden`）。嵌进已有滚动容器预览时传 `false`。 */
  fitViewport?: boolean;
}

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** 贴左还是贴右。 */
  side?: SidebarSide;
  /** 桌面端折叠形态。 */
  collapsible?: SidebarCollapsible;
  /** 移动端抽屉的无障碍标题（视觉隐藏）。 */
  mobileTitle?: ReactNode;
  /** 移动端抽屉的无障碍说明（视觉隐藏）。 */
  mobileDescription?: ReactNode;
  /** 移动端是否渲染抽屉自带的右上角关闭按钮。默认关掉，避免压住导航首项。 */
  mobileShowClose?: boolean;
  /** 追加到移动端抽屉面板（走 twMerge）。 */
  mobileClassName?: string;
}

export interface SidebarTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 渲染成自定义元素（如库内 `<Button />`）；点击回调、无障碍名与类名都会合并进去。 */
  render?: ReactElement;
}

export interface SidebarRailProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 无障碍名。默认取 locale 的 `sidebar.rail` —— 刻意与 `SidebarTrigger` 不同字，避免同名两按钮。 */
  label?: string;
}

export interface SidebarGroupActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 渲染成自定义元素（路由 `<Link>` 等）。 */
  render?: ReactElement;
}

export interface SidebarMenuButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 当前项高亮，同时置 `aria-current="page"`。 */
  isActive?: boolean;
  /** 行高档位。 */
  size?: "sm" | "md" | "lg";
  /** 折叠到 icon 档时补的文字说明。只在 `state === "collapsed" && !isMobile` 时启用。 */
  tooltip?: ReactNode;
  /** Tooltip 出现方向。右侧栏应传 `"left"`。 */
  tooltipSide?: "top" | "right" | "bottom" | "left";
  /** 渲染成自定义元素（`<a>` / 路由 `<Link>`），拿到真链接语义 + 客户端路由。 */
  render?: ReactElement;
}

export interface SidebarMenuActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 仅在悬停 / 聚焦 / 该项激活时显形，否则透明。 */
  showOnHover?: boolean;
  /** 渲染成自定义元素（如 `MenuTrigger`）。 */
  render?: ReactElement;
}

export interface SidebarMenuSubButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 当前项高亮，同时置 `aria-current="page"`。 */
  isActive?: boolean;
  /** 行高档位。 */
  size?: "sm" | "md";
  /** 渲染成自定义元素（`<a>` / 路由 `<Link>`）。 */
  render?: ReactElement;
}

export interface SidebarMenuSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** 是否显示行首的图标占位方块。 */
  showIcon?: boolean;
  /** 文字条宽度（任意 CSS 长度）。**确定值**，不要用随机宽度：SSR 与 hydration 会对不上。 */
  width?: string;
}

/** `SidebarInput` 透传 `Input` 的全部属性，只换一套贴合侧栏的尺寸与底色。 */
export type SidebarInputProps = InputProps;
