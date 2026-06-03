import type { ReactNode } from "react";

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

export interface ListboxProps {
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
  "aria-label"?: string;
}
