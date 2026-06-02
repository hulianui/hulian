import type { ReactNode } from "react";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectTriggerProps {
  /** 无选中值时的占位文本（透传 Base UI Select.Value 的 placeholder）。 */
  placeholder?: ReactNode;
  size?: SelectSize;
  /** 独立使用（非 Field 内）时手动置无效态皮肤。 */
  invalid?: boolean;
  className?: string;
}

export interface SelectContentProps {
  children: ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}

export interface SelectItemProps {
  /** 选项值（本批原始 string 值；对象值留后续批次）。 */
  value: string;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
}
