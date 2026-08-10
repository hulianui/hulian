import type { HTMLAttributes, ReactNode } from "react";

/**
 * 继承根节点原生属性（`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` …）。
 * 表单受控件必须能接 react-hook-form 的 `Controller` —— 尤其 `field.onBlur` 传不进去时
 * `touchedFields` 永不更新、`mode: "onBlur"` 的表单静默失效（#157）。
 */
export interface RatingProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  value?: number;
  defaultValue?: number;
  /** 瑚琏命名受控回调（替代 MUI onChange(e,v)） */
  onValueChange?: (value: number | null) => void;
  max?: number;
  readOnly?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  /** 星色（任意 CSS 颜色或 token var()），默认 var(--color-primary)；hover 自动派生 */
  color?: string;
  /** 自定义图标（替代默认实心五角星），如 <Heart /> */
  icon?: ReactNode;
  /** 自定义空状态图标，缺省时复用 icon（同形状走空色） */
  emptyIcon?: ReactNode;
  className?: string;
}
