import type { ElementType, HTMLAttributes, ReactNode } from "react";
import type { PolymorphicProps } from "../lib/polymorphic";

export type TextSize = "xs" | "sm" | "base" | "lg" | "xl";
export type TextTone = "default" | "muted" | "primary" | "success" | "warning" | "danger";
export type TextWeight = "normal" | "medium" | "semibold" | "bold";

export interface TextOwnProps {
  className?: string;
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

/** `as` 参与类型推导（hulianui/hulian#62）。 */
export type TextProps<E extends ElementType = "p"> = PolymorphicProps<E, TextOwnProps>;
