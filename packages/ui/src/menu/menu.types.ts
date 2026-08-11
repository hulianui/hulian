import type { MouseEventHandler, ReactNode } from "react";

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
