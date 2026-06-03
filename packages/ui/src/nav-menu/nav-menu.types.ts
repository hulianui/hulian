import type { HTMLAttributes, ReactNode } from "react";

/** 普通菜单项（叶子或可展开父项）。 */
export interface NavMenuItem {
  /** 唯一键；选中态 selectedKeys / 展开态 openKeys 均以此标识。 */
  key: string;
  label: ReactNode;
  /** 行首图标；collapsed 模式下作为收起态唯一可视内容。 */
  icon?: ReactNode;
  /** 叶子链接：提供则渲染 `<a>`（点击导航），否则渲染 `<button>`。父项忽略。 */
  href?: string;
  disabled?: boolean;
  /** 子菜单；非空即视为可展开父项。 */
  children?: NavMenuItem[];
}

/** 分组：渲染一段不可折叠的小标题 + 其下子项（以 `type:"group"` 区分）。 */
export interface NavMenuGroup {
  type: "group";
  /** 唯一键（仅作 React key / 去重用，不进选中/展开态）。 */
  key: string;
  label: ReactNode;
  children: NavMenuItem[];
}

export type NavMenuNode = NavMenuItem | NavMenuGroup;

export interface NavMenuProps extends Omit<HTMLAttributes<HTMLElement>, "onSelect"> {
  /** 树形菜单数据。 */
  items: NavMenuNode[];
  /** inline=手风琴内联展开（主用）；collapsed=Sider 收起态图标 + 悬浮飞出子菜单。 */
  mode?: "inline" | "collapsed";
  /** 选中态（受控）。 */
  selectedKeys?: string[];
  /** 选中态（非受控初值）。 */
  defaultSelectedKeys?: string[];
  /** 点击叶子项触发。 */
  onSelect?: (key: string, item: NavMenuItem) => void;
  /** 展开态（受控）。 */
  openKeys?: string[];
  /** 展开态（非受控初值）。 */
  defaultOpenKeys?: string[];
  /** 展开态变化回调。 */
  onOpenChange?: (openKeys: string[]) => void;
}
