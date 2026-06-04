import type { HTMLAttributes, ReactNode } from "react";

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger";
export type BadgePlacement = "top-right" | "top-left" | "bottom-right" | "bottom-left";

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "content"> {
  /** 数字计数。为 0 时默认隐藏（除非 showZero）。 */
  count?: number;
  /** 超过 max 显示 `max+`（默认 99）。 */
  max?: number;
  /** 仅显示小圆点，不显示数字（优先级高于 count）。 */
  dot?: boolean;
  /** 自定义角标内容（如图标 ✓）。优先级最高，覆盖 count/dot。 */
  content?: ReactNode;
  /** count=0 仍显示。 */
  showZero?: boolean;
  /** 强制隐藏角标，保留被包裹的子元素。 */
  invisible?: boolean;
  /** 语气色，默认 danger（通知红）。 */
  tone?: BadgeTone;
  size?: "sm" | "md";
  /** 有 children 时角标叠加的角位，默认 top-right。 */
  placement?: BadgePlacement;
  /** 角标位置微调 [x, y]，单位 px（正值=右/下）。圆形宿主常用来外推贴边。 */
  offset?: [number, number];
  children?: ReactNode;
}
