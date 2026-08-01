import type { ElementType, HTMLAttributes, ReactNode } from "react";
import type { PolymorphicProps } from "../lib/polymorphic";

export type ProseSize = "sm" | "base";

export interface ProseOwnProps {
  className?: string;
  /** 整体排版尺寸基准。@default "base" */
  size?: ProseSize;
  children?: ReactNode;
}

/** `as` 参与类型推导（hulianui/hulian#62）。 */
export type ProseProps<E extends ElementType = "div"> = PolymorphicProps<E, ProseOwnProps>;
