import type { ReactNode } from "react";
import type { LayoutBreakpoint } from "../layout/layout.types";
import type { NavMenuItem, NavMenuNode } from "../nav-menu/nav-menu.types";

/** 一个打开的页签。 */
export interface AdminTab {
  key: string;
  label: ReactNode;
  /** 是否可关闭（默认：当打开页签 >1 时可关，最后一个不可关）。 */
  closable?: boolean;
}

export interface AdminLayoutProps {
  /** 侧边菜单数据（复用 NavMenu）。 */
  menuItems: NavMenuNode[];
  /** 品牌区（展开态）。 */
  logo?: ReactNode;
  /** 品牌区（收起态，默认复用 logo）。 */
  logoCollapsed?: ReactNode;

  // —— 菜单选中（受控/非受控）——
  selectedKey?: string;
  defaultSelectedKey?: string;
  /** 点击菜单叶子项触发。 */
  onMenuSelect?: (key: string, item: NavMenuItem) => void;
  // —— 菜单展开 ——
  openKeys?: string[];
  defaultOpenKeys?: string[];
  onOpenChange?: (openKeys: string[]) => void;

  // —— 侧栏折叠（受控/非受控）——
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /**
   * 响应式断点（与 LayoutSider 同语义）：视口 ≤ 该宽度时自动收起侧栏、> 时展开。
   * 非受控时直接改内部收起态；受控（传了 collapsed）时不改状态、只触发 onCollapsedChange，
   * 由消费侧决定是否跟随。不设则保持现有行为（不自动收起）。
   */
  breakpoint?: LayoutBreakpoint;

  // —— 多页签 ——
  /** 关闭多页签条（默认 true）。 */
  showTabs?: boolean;
  /** 受控页签列表。不传则由菜单点击自动维护（非受控）。 */
  tabs?: AdminTab[];
  /** 受控当前激活页签 key。 */
  activeKey?: string;
  /** 非受控时的初始激活页签（亦决定首屏自动打开的页签）。 */
  defaultActiveKey?: string;
  onTabChange?: (key: string) => void;
  onTabClose?: (key: string) => void;

  // —— 顶栏 ——
  /** 顶栏面包屑区。 */
  breadcrumb?: ReactNode;
  /** 顶栏右侧扩展区（用户菜单 / 通知 / 主题切换等）。 */
  headerExtra?: ReactNode;

  /**
   * 是否自占满视口高度（默认 true）。作为整页应用骨架时保持 true：
   * 骨架固定 100dvh、内容区内部滚动，不靠祖先元素撑高度。
   * 嵌入到有固定高度的容器里预览时（如文档示例卡）置 false，改为 `h-full` 跟随父容器。
   */
  fitViewport?: boolean;
  /** 主内容（当前激活页内容，由上层按 activeKey 决定）。 */
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
}
