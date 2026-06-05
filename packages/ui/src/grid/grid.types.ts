import type { ElementType, HTMLAttributes, ReactNode } from "react";

/** 响应式列数：按断点给列数（base 为默认/最小屏）。 */
export interface ResponsiveCols {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
}

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /** 列数。传数字=固定列数（任意值·inline style）；传 {base,sm,md,lg}=响应式（静态类）。@default 1 */
  cols?: number | ResponsiveCols;
  /** 行数（不填则按内容自动）。 */
  rows?: number;
  /** 行列间距（× 0.25rem）。@default 0 */
  gap?: number;
  /** 列间距覆盖 gap（× 0.25rem）。 */
  colGap?: number;
  /** 行间距覆盖 gap（× 0.25rem）。 */
  rowGap?: number;
  /** 用 inline-grid 而非 grid。@default false */
  inline?: boolean;
  /** 渲染的元素标签。@default "div" */
  as?: ElementType;
  children?: ReactNode;
}

export interface GridItemProps extends HTMLAttributes<HTMLElement> {
  /** 跨列数。 */
  colSpan?: number;
  /** 跨行数。 */
  rowSpan?: number;
  /** 渲染的元素标签。@default "div" */
  as?: ElementType;
  children?: ReactNode;
}
