import type { ElementType, HTMLAttributes, ReactNode } from "react";

export type StackAlign = "start" | "center" | "end" | "stretch" | "baseline";
export type StackJustify = "start" | "center" | "end" | "between" | "around" | "evenly";

export interface StackProps extends HTMLAttributes<HTMLElement> {
  /** 主轴方向。@default "column" */
  direction?: "row" | "column";
  /** 子项间距（× 0.25rem，同 Tailwind spacing 刻度）。@default 0 */
  gap?: number;
  /** 交叉轴对齐。 */
  align?: StackAlign;
  /** 主轴对齐。 */
  justify?: StackJustify;
  /** 是否换行（仅 row 有意义）。@default false */
  wrap?: boolean;
  /** 用 inline-flex 而非 flex（随内容收缩、可与文字基线排列）。@default false */
  inline?: boolean;
  /** 渲染的元素标签。@default "div" */
  as?: ElementType;
  children?: ReactNode;
}
