import type { HTMLAttributes, ElementType, ReactNode } from "react";
import type { PolymorphicProps } from "../lib/polymorphic";

export interface StreamingTextOwnProps {
  className?: string;
  /** 当前累积文本（随 token 到达由父级增长）。 */
  text: string;
  /** 流式进行中：尾随闪烁光标；done 后去除光标。 */
  streaming?: boolean;
  /** 自定义光标节点（默认闪烁竖线）。 */
  cursor?: ReactNode;
}

/** `as` 参与类型推导（hulianui/hulian#62）。 */
export type StreamingTextProps<E extends ElementType = "span"> = PolymorphicProps<E, StreamingTextOwnProps>;
