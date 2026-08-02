import type { ElementType, ReactNode } from "react";
import type { PolymorphicProps } from "../lib/polymorphic";

/**
 * 最大宽度档（映射到 Tailwind 的 max-w-*）：
 * sm=2xl / md=3xl / lg=4xl / xl=5xl / 2xl=6xl / 3xl=7xl / full=不限。
 * 2xl 与 3xl 是后补的——营销页的功能区（6xl）与页脚（7xl）此前落不下档，
 * 只能 `size="full"` 再用 className 把宽度加回来，等于绕开组件语义（hulianui/hulian#58）。
 */
export type ContainerSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";

export interface ContainerOwnProps {
  /** 最大宽度档。@default "xl" */
  size?: ContainerSize;
  /**
   * 左右安全内距。
   * **只管内距**：早先它同时关掉居中，导致「要居中但要自定义内距」做不到；
   * 居中现由 `centered` 单独控制（hulianui/hulian#58）。
   * @default true
   */
  padded?: boolean;
  /** 是否水平居中（mx-auto）。@default true */
  centered?: boolean;
  children?: ReactNode;
  className?: string;
}

/** `as` 参与类型推导：`as="section"` / `as="main"` 时拿到对应元素的属性与事件类型。 */
export type ContainerProps<E extends ElementType = "div"> = PolymorphicProps<E, ContainerOwnProps>;
