import type { ReactNode } from "react";

export interface RatingProps {
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
