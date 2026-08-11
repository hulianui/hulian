import type { ElementType, ReactNode } from "react";
import type { PolymorphicProps } from "../lib/polymorphic";

export type ProseSize = "sm" | "base";

export interface ProseOwnProps {
  className?: string;
  /** 整体排版尺寸基准。@default "base" */
  size?: ProseSize;
  /**
   * 宽表兜底：把 `table` 自身变成横向滚动容器（列多时不再撑破版心），表头随之不换行。
   * 代价是表格宽度改为按内容撑开、不再恒占满版心，所以默认关。@default false
   */
  scrollableTables?: boolean;
  children?: ReactNode;
}

/** `as` 参与类型推导（hulianui/hulian#62）。 */
export type ProseProps<E extends ElementType = "div"> = PolymorphicProps<E, ProseOwnProps>;
