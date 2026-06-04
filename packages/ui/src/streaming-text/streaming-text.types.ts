import type { HTMLAttributes, ElementType, ReactNode } from "react";

export interface StreamingTextProps extends HTMLAttributes<HTMLElement> {
  /** 当前累积文本（随 token 到达由父级增长）。 */
  text: string;
  /** 流式进行中：尾随闪烁光标；done 后去除光标。 */
  streaming?: boolean;
  /** 渲染标签。@default "span" */
  as?: ElementType;
  /** 自定义光标节点（默认闪烁竖线）。 */
  cursor?: ReactNode;
}
