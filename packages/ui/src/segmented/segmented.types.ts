import type { ReactNode } from "react";

export interface SegmentedItem {
  /** 该段的唯一值（也是选中态的标识）。 */
  value: string;
  /** 段内容（文字或图标）。 */
  label: ReactNode;
  /** 无障碍名称：label 为富节点（图标/徽标）时必填，否则降级取 value（英文键，念读不友好）。 */
  ariaLabel?: string;
  /** 单段禁用（整体 disabled 之外的细粒度控制）。 */
  disabled?: boolean;
}

export interface SegmentedProps {
  /** 段定义数组。 */
  items: SegmentedItem[];
  /** 受控选中值。 */
  value?: string;
  /** 非受控初始选中值（缺省取首个未禁用段）。 */
  defaultValue?: string;
  /** 瑚琏收敛签名（单值，radio 语义互斥）。 */
  onValueChange?: (value: string) => void;
  /** 整体禁用。 */
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
}
