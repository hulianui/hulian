import type { ComponentProps, ReactNode } from "react";
import type { Select as BaseSelect } from "@base-ui-components/react/select";

export type SelectSize = "sm" | "md" | "lg";

// rc.0 的 Select.Value 无 placeholder prop（context7 文档对应 v1.2+，与本项目 rc.0 不符，实证见 spec §2）。
// 瑚琏把 placeholder 提升到 Select：内部注入一个 value:null 的 items 项作占位 label，
// 无值时 Base UI 的 resolveSelectedLabel 命中该 null 项自动显示其 label。
export interface SelectProps extends Omit<ComponentProps<typeof BaseSelect.Root>, "items"> {
  /** 选项数据（{value,label}）；Base UI 据此让 Trigger 显示选中项 label 而非 raw value。 */
  items?: ReadonlyArray<{ value: string | null; label: ReactNode }>;
  /** 无选中值时的占位文本（瑚琏注入 value:null 项实现，rc.0 无 Value.placeholder prop）。 */
  placeholder?: ReactNode;
}

export interface SelectTriggerProps {
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
