import type { ElementType, ReactNode } from "react";
import type { PolymorphicProps } from "../lib/polymorphic";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
export type HeadingWeight = "normal" | "medium" | "semibold" | "bold";

export interface HeadingOwnProps {
  className?: string;
  /** 标题级别，决定语义标签 h{level} 与默认视觉尺寸。@default 2 */
  level?: HeadingLevel;
  /** 覆盖视觉尺寸（独立于 level）。默认按 level 派生 */
  size?: HeadingSize;
  /** 字重。@default "semibold" */
  weight?: HeadingWeight;
  /** 启用 text-balance 平衡换行（多行标题更匀称）。@default false */
  balance?: boolean;
  children?: ReactNode;
}

/** `as` 参与类型推导（hulianui/hulian#62）。 */
export type HeadingProps<E extends ElementType = "h2"> = PolymorphicProps<E, HeadingOwnProps>;
