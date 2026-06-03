import type { ElementType, HTMLAttributes, ReactNode } from "react";

export type ProseSize = "sm" | "base";

export interface ProseProps extends HTMLAttributes<HTMLElement> {
  /** 渲染的容器标签。@default "article" */
  as?: ElementType;
  /** 整体排版尺寸基准。@default "base" */
  size?: ProseSize;
  children?: ReactNode;
}
