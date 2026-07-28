import type { ReactNode } from "react";

export interface RouteTabItem {
  key: string;
  label: ReactNode;
  /** 标签前的小图标。 */
  icon?: ReactNode;
  /**
   * 是否可关闭。默认：`pinned` 的不可关；其余在「可关闭页签数 > 1」时可关
   * （关到只剩一个就不给关了，免得内容区空白）。
   */
  closable?: boolean;
  /** 固定页签：恒不可关、排在最前，且不受「关闭其他/全部」影响。 */
  pinned?: boolean;
}

/** 右键菜单里的批量动作。 */
export type RouteTabsAction =
  | "close"
  | "closeOthers"
  | "closeLeft"
  | "closeRight"
  | "closeAll"
  | "refresh";

export interface RouteTabsMenuItem {
  key: string;
  label: ReactNode;
  disabled?: boolean;
}

export interface RouteTabsProps {
  /** 页签列表。**组件不持有它** —— 增删由消费方在回调里做。 */
  items: RouteTabItem[];
  /** 当前激活的页签 key。 */
  activeKey?: string;
  /** 切换激活页签。 */
  onChange?: (key: string) => void;
  /** 关闭单个页签（点 × 或右键「关闭」）。 */
  onClose?: (key: string) => void;
  /**
   * 批量动作。第三参是**该动作实际影响到的 key 列表**（已排除 pinned 与不可关的），
   * 消费方照它改 items 即可，不必自己再算一遍「哪些该关」。
   *
   * `refresh` 不改 items，只是把「请重新挂载这一页」的意图传出去 —— keep-alive 的实现
   * 各家不同（换 remount key / 清缓存 / 重新请求），组件不替你决定。
   */
  onAction?: (action: RouteTabsAction, tabKey: string, affectedKeys: string[]) => void;
  /** 右键菜单开放哪些动作。@default 全部 */
  actions?: RouteTabsAction[];
  /** 追加的自定义右键菜单项（排在内置动作之后）。 */
  extraMenuItems?: RouteTabsMenuItem[];
  /** 自定义菜单项被点击。 */
  onExtraAction?: (menuKey: string, tabKey: string) => void;
  /** 允许拖拽调序。须配 `onReorder`。@default false */
  sortable?: boolean;
  /** 拖拽调序后的完整 key 顺序（pinned 恒在前，组件已保证）。 */
  onReorder?: (keys: string[]) => void;
  /** 关掉「激活页签自动滚入视口」。@default false */
  disableAutoScroll?: boolean;
  className?: string;
}
