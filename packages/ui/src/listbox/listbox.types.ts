import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface ListboxItemData {
  /** 唯一键（选中/禁用/动作回调都用它）。 */
  key: string;
  label: ReactNode;
  /** 次级描述（label 下方 muted 小字）。 */
  description?: ReactNode;
  /** 行首插槽（图标/头像）。 */
  startContent?: ReactNode;
  /** 行尾插槽（快捷键/徽标；选中勾在其右）。 */
  endContent?: ReactNode;
  disabled?: boolean;
}

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 表单受控件必须能接 react-hook-form 的 `Controller` —— 尤其 `field.onBlur` 传不进去时
 * `touchedFields` 永不更新、`mode: "onBlur"` 的表单静默失效（#157）。
 */
export interface ListboxProps extends HTMLAttributes<HTMLDivElement> {
  items: ListboxItemData[];
  /** none=纯动作列表(不持有选中态)；single/multiple=可选。默认 single。 */
  selectionMode?: "none" | "single" | "multiple";
  /** 受控选中键。 */
  selectedKeys?: string[];
  /** 非受控初始选中键。 */
  defaultSelectedKeys?: string[];
  onSelectionChange?: (keys: string[]) => void;
  /** 额外禁用键（与 item.disabled 合并）。 */
  disabledKeys?: string[];
  /** 任意项激活都触发（含 none 模式），用于命令式动作。 */
  onAction?: (key: string) => void;
  className?: string;
  /** 行内样式，落在列表根元素。用于表达 Tailwind 类给不出的动态值（如运行时决定的 maxHeight）。 */
  style?: CSSProperties;
  "aria-label"?: string;
}
