import type { ReactNode } from "react";
import type { Combobox as BaseCombobox } from "@base-ui-components/react/combobox";

export type ComboboxSize = "sm" | "md" | "lg";

/** 选项数据：{value,label}。Base UI 自动用 label 显示、value 提交（无需 itemToString）。 */
export interface ComboboxItemData {
  value: string;
  label: ReactNode;
}

// 透明转发 Combobox.Root（单选，Multiple 固定 false）。
// 用 BaseCombobox.Root.Props<Value,Multiple> 显式钉死泛型（Root 是泛型函数，ComponentProps 推不准）。
export type ComboboxProps = Omit<BaseCombobox.Root.Props<ComboboxItemData, false>, "multiple"> & {
  children?: ReactNode;
};

export interface ComboboxInputProps {
  size?: ComboboxSize;
  placeholder?: string;
  /** 独立使用（非 Field 内）时手动置无效态皮肤。 */
  invalid?: boolean;
  /** 渲染清除按钮（Combobox.Clear，有值时显示）。 */
  clearable?: boolean;
  className?: string;
}

/** 图4 范式触发按钮：显示已选 label / placeholder，点击展开「弹层内搜索」式浮层。 */
export interface ComboboxTriggerProps {
  size?: ComboboxSize;
  /** 未选中时占位文案。 */
  placeholder?: string;
  /** 独立使用（非 Field 内）时手动置无效态皮肤。 */
  invalid?: boolean;
  className?: string;
}

export interface ComboboxContentProps {
  /** render fn：List 自动遍历已过滤项调用。 */
  children: (item: ComboboxItemData, index: number) => ReactNode;
  emptyMessage?: ReactNode;
  /** 设置后在浮层顶部渲染搜索框（图4 范式，配合 ComboboxTrigger 使用）。不设则无内置搜索框（内联自动补全态）。 */
  searchPlaceholder?: string;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}

export interface ComboboxItemProps {
  /** 选项值（{value,label} 对象，Base UI 自动派生 label/value）。 */
  value: ComboboxItemData;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}
