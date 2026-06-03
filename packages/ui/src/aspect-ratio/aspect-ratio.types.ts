import type { HTMLAttributes, ReactNode } from "react";

export interface AspectRatioProps extends HTMLAttributes<HTMLDivElement> {
  /** 宽高比（宽 / 高），如 16/9、1、4/3。@default 1 */
  ratio?: number;
  children?: ReactNode;
}
