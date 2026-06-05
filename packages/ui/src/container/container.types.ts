import type { ElementType, HTMLAttributes, ReactNode } from "react";

export type ContainerSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  /** 最大宽度档：sm=2xl / md=3xl / lg=4xl / xl=5xl / full=不限。@default "xl" */
  size?: ContainerSize;
  /** 是否水平居中并加左右安全内距。@default true */
  padded?: boolean;
  /** 渲染标签（语义/布局解耦，如 section/main/article）。@default "div" */
  as?: ElementType;
  children?: ReactNode;
}
