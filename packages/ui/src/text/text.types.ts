import type { ElementType, HTMLAttributes, ReactNode } from "react";

export type TextSize = "xs" | "sm" | "base" | "lg" | "xl";
export type TextTone = "default" | "muted" | "primary" | "danger";
export type TextWeight = "normal" | "medium" | "semibold" | "bold";

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
  /** 渲染的元素标签。@default "p" */
  as?: ElementType;
  /** 字号。@default "base" */
  size?: TextSize;
  /** 语义色调。@default "default" */
  tone?: TextTone;
  /** 字重。@default "normal" */
  weight?: TextWeight;
  /** 单行省略号截断。 */
  truncate?: boolean;
  /** 多行截断（最多 n 行后省略号）；设置后优先于 truncate。 */
  lineClamp?: number;
  children?: ReactNode;
}
