import type { ElementType, HTMLAttributes, ReactNode } from "react";

export interface GridProps extends HTMLAttributes<HTMLElement> {
  /** 列数。@default 1 */
  cols?: number;
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
