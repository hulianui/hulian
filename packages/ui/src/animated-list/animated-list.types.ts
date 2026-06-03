import type { ReactNode } from "react";

export interface AnimatedListProps {
  children?: ReactNode;
  /** 相邻子项入场间隔(s)。 */
  stagger?: number;
  className?: string;
}
