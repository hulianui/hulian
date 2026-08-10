import type { ElementType } from "react";
import type { PolymorphicProps } from "../lib/polymorphic";

export type SafeAreaEdge = "top" | "right" | "bottom" | "left";
/** 边集合：枚举数组，或语义别名 all/vertical/horizontal。 */
export type SafeAreaEdges = SafeAreaEdge[] | "all" | "vertical" | "horizontal";

export interface SafeAreaOwnProps {
  className?: string;
  /** 应用哪几条安全区 inset，默认 "all"。 */
  edges?: SafeAreaEdges;
  /** 以 padding(默认·撑开自身) 还是 margin(外推) 形式应用。 */
  mode?: "padding" | "margin";
  /** 每条 inset 的最小值(数字=px 或任意 CSS 长度)，env 取不到时的兜底。默认 0。 */
  min?: number | string;
}

/** `as` 参与类型推导（hulianui/hulian#62）。 */
export type SafeAreaProps<E extends ElementType = "div"> = PolymorphicProps<E, SafeAreaOwnProps>;
