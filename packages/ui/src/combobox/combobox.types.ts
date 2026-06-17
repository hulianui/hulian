import type { ReactNode } from "react";
import type { Combobox as BaseCombobox } from "@base-ui/react/combobox";

export type ComboboxSize = "sm" | "md" | "lg";

/** 选项数据：{value,label}。Base UI 自动用 label 显示、value 提交（无需 itemToString）。 */
export interface ComboboxItemData {
  value: string;
  label: ReactNode;
}

// 透明转发 Combobox.Root。泛型 Multiple 默认 false（单选）→ 旧用法零变化、向后兼容；
// 传 multiple 即推断为 true，value/onValueChange 自动变数组（Base UI 原生支持）。
export type ComboboxProps<Multiple extends boolean = false> =
  BaseCombobox.Root.Props<ComboboxItemData, Multiple> & {
    children?: ReactNode;
  };

/** 多选 chips 外壳（可见字段）：内含 chip 列 + 输入框 + chevron；注册为浮层锚点。 */
export interface ComboboxChipsProps {
  size?: ComboboxSize;
  /** 独立使用（非 Field 内）时手动置无效态皮肤。 */
  invalid?: boolean;
  /** 输入框占位（一般仅在无选中时给）。 */
  placeholder?: string;
  className?: string;
  children?: ReactNode;
}

/** 单个已选 chip（pill + 删除 ×，删除按 chips 内渲染顺序绑定 selectedValue[index]）。 */
export interface ComboboxChipProps {
  children: ReactNode;
  className?: string;
}

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
