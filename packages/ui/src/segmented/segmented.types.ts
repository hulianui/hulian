import type { HTMLAttributes, ReactNode } from "react";

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

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 表单受控件必须能接 react-hook-form 的 `Controller` —— 尤其 `field.onBlur` 传不进去时
 * `touchedFields` 永不更新、`mode: "onBlur"` 的表单静默失效（#157）。
 */
export interface SegmentedProps extends HTMLAttributes<HTMLDivElement> {
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
