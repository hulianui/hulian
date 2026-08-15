import type { MouseEventHandler, ReactElement, ReactNode } from "react";

export interface MenuContentProps {
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}

export interface MenuItemProps {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * 渲染成另一个元素（Next `<Link>` / `<a>`），菜单项的 props 与 `role="menuitem"`、
   * 键盘漫游一并合并进去（#273）。
   *
   * **导航型菜单项应当用它，而不是 `onClick` + `router.push`**：只有真 `<a href>` 才有
   * 中键点击、Cmd/Ctrl+点击开新标签、右键「在新标签页中打开」、悬停时状态栏的 href 预览。
   * 劫持 click 的一方得把这些原生行为一条条补回来，漏一条用户就发现「这个菜单不能新标签打开」。
   *
   * 只有 `MenuItem` 有：`MenuCheckboxItem` / `MenuRadioItem` / `MenuSubTrigger` 的语义是
   * 「切一个状态」「展开下一级」而不是「去一个地方」。
   *
   * @example <MenuItem render={<Link href="/settings/roles" />}>角色管理</MenuItem>
   */
  render?: ReactElement;
  disabled?: boolean;
  /** 点击后是否关闭菜单。@default true */
  closeOnClick?: boolean;
  /** 类型筛选用文案覆盖（键盘 type-ahead）。 */
  label?: string;
  variant?: "default" | "danger";
  className?: string;
}

export interface MenuCheckboxItemProps {
  children?: ReactNode;
  /** 是否勾选（受控）。要非受控请改用 defaultChecked。 */
  checked?: boolean;
  /** 初始是否勾选（非受控）。@default false */
  defaultChecked?: boolean;
  /** 勾选态变化回调。 */
  onCheckedChange?: (checked: boolean) => void;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  /** 点击后是否关闭菜单。勾选项默认**不关**，便于连续勾选。@default false */
  closeOnClick?: boolean;
  /** 类型筛选用文案覆盖（键盘 type-ahead）。 */
  label?: string;
  variant?: "default" | "danger";
  className?: string;
}

export interface MenuRadioGroupProps {
  children?: ReactNode;
  /** 当前选中项的值（受控）。要非受控请改用 defaultValue。 */
  value?: string;
  /** 初始选中项的值（非受控）。 */
  defaultValue?: string;
  /** 选中值变化回调。 */
  onValueChange?: (value: string) => void;
  /** 整组禁用。@default false */
  disabled?: boolean;
  className?: string;
}

export interface MenuRadioItemProps {
  children?: ReactNode;
  /** 本项的值；与所在 MenuRadioGroup 的 value 相等即为选中态。 */
  value: string;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  /** 点击后是否关闭菜单。单选项默认**不关**，选完想收起菜单要显式传 true。@default false */
  closeOnClick?: boolean;
  /** 类型筛选用文案覆盖（键盘 type-ahead）。 */
  label?: string;
  variant?: "default" | "danger";
  className?: string;
}

// 子菜单触发项**没有** closeOnClick：它的点击语义是「展开下一级」而不是「执行动作」，
// 关掉整个菜单反而是 bug。这不是漏抄 MenuItemProps，是刻意的差集。
export interface MenuSubTriggerProps {
  children?: ReactNode;
  disabled?: boolean;
  /** 键盘 type-ahead 用文案覆盖。 */
  label?: string;
  variant?: "default" | "danger";
  className?: string;
}

// 子面板不开放 side/align/sideOffset：级联菜单的方位是这个形态的定义之一（父项右侧展开、
// 顶边对齐），越界的部分由 Base UI 自动翻边处理。要另一种方位说明要的不是子菜单，是另开一个 Menu。
export interface MenuSubContentProps {
  children: ReactNode;
  className?: string;
}
