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
 * 语义档。与 `TabsList` 的 `tone` 同名同取值 —— Segmented 与 solid Tabs 是同一套视觉
 *（同 `bg-track` 凹槽、同 `bg-surface` 滑块），选中色再分叉就会出现「长得一样、选中色不同」
 * 的两件组件（#316）。取值仍是「语义 tone SSOT」（见 `Button` 的 `tone`）的子集。
 */
export type SegmentedTone = "brand" | "success" | "warning" | "danger" | "neutral";

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
  /**
   * 选中段的语义色档。@default "neutral"
   *
   * 只染选中段的文字，滑块保持 `bg-surface` 白药丸（同 Tabs solid：白药丸 + 语义字）。
   * 默认 `neutral` = **逐字保持库既有的渲染**（选中段 `text-foreground`），不是"换成灰"——
   * 这一档存在的意义是让存量页面零视觉变化；要品牌色显式传 `tone="brand"`。
   */
  tone?: SegmentedTone;
  className?: string;
  "aria-label"?: string;
}
