import type { ElementType, HTMLAttributes, ReactNode } from "react";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
export type HeadingWeight = "normal" | "medium" | "semibold" | "bold";

export interface HeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, "color"> {
  /** 标题级别，决定语义标签 h{level} 与默认视觉尺寸。@default 2 */
  level?: HeadingLevel;
  /** 覆盖渲染标签（视觉/语义解耦，如 level=1 样式渲染为 div）。默认 `h{level}` */
  as?: ElementType;
  /** 覆盖视觉尺寸（独立于 level）。默认按 level 派生 */
  size?: HeadingSize;
  /** 字重。@default "semibold" */
  weight?: HeadingWeight;
  /** 启用 text-balance 平衡换行（多行标题更匀称）。@default false */
  balance?: boolean;
  children?: ReactNode;
}
