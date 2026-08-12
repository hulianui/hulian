import type { MouseEventHandler, ReactNode } from "react";
import type {
  MenuCheckboxItemProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuSubTriggerProps,
  MenuSubContentProps,
} from "../menu/menu.types";

export interface ContextMenuContentProps {
  children: ReactNode;
  className?: string;
}

export interface ContextMenuItemProps {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  /** 点击后是否关闭菜单。@default true */
  closeOnClick?: boolean;
  /** 键盘 type-ahead 用文案覆盖。 */
  label?: string;
  variant?: "default" | "danger";
  className?: string;
}

// 勾选 / 单选三件与 Menu 完全同形：Base UI 的 context-menu 直接复用 menu 的 CheckboxItem /
// RadioGroup / RadioItem 部件，瑚琏这边也复用同一份实现，别名而非再抄一遍接口，避免两边漂移。
export type ContextMenuCheckboxItemProps = MenuCheckboxItemProps;
export type ContextMenuRadioGroupProps = MenuRadioGroupProps;
export type ContextMenuRadioItemProps = MenuRadioItemProps;

// 子菜单两件同理别名到 Menu 侧：#212 之前这两个接口在本文件另抄了一份，Menu 补齐时若再抄第三份，
// 「同一形态两处各自维护」这个成因就原样保留了。别名让两边只能一起改。
export type ContextMenuSubTriggerProps = MenuSubTriggerProps;
export type ContextMenuSubContentProps = MenuSubContentProps;
