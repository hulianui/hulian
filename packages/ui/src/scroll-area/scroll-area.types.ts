import type { ReactNode } from "react";

export interface ScrollAreaProps {
  /** 滚动方向，默认 vertical；both 时双向滚动条 + corner。 */
  orientation?: "vertical" | "horizontal" | "both";
  /** 限高/限宽由消费者经 className 给 Root（如 h-48 / w-64）。 */
  className?: string;
  children?: ReactNode;
}
