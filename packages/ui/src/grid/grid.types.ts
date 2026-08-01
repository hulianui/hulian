import type { ElementType, ReactNode } from "react";
import type { PolymorphicProps } from "../lib/polymorphic";

/** 响应式列数：按断点给列数（base 为默认/最小屏）。断点表与 Tailwind 对齐到 2xl。 */
export interface ResponsiveCols {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
}

export interface GridOwnProps {
  /** 列数。传数字=固定列数（任意值·inline style）；传 {base,sm,md,lg,xl,2xl}=响应式（静态类）。@default 1 */
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
  children?: ReactNode;
  className?: string;
}

/** `as` 参与类型推导（hulianui/hulian#62）。 */
export type GridProps<E extends ElementType = "div"> = PolymorphicProps<E, GridOwnProps>;

export interface GridItemOwnProps {
  /** 跨列数。 */
  colSpan?: number;
  /** 跨行数。 */
  rowSpan?: number;
  children?: ReactNode;
  className?: string;
}

export type GridItemProps<E extends ElementType = "div"> = PolymorphicProps<E, GridItemOwnProps>;
