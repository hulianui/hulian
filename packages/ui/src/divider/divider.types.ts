import type { ReactNode } from "react";

/** 方向：水平分隔（默认）或行内垂直分隔。 */
export type DividerType = "horizontal" | "vertical";

/** 嵌入文字的水平位置（仅 horizontal + 有文字时生效）。 */
export type DividerOrientation = "left" | "center" | "right";

export interface DividerProps {
  /** 方向，默认 horizontal。vertical 为行内分隔（嵌在一行文本/元素之间）。 */
  type?: DividerType;
  /** 文字位置，默认 center。 */
  orientation?: DividerOrientation;
  /** 虚线。 */
  dashed?: boolean;
  /** 文字常规字重（默认加粗一档）。 */
  plain?: boolean;
  /** 嵌入分隔线中的文字；不传则为纯分隔线。 */
  children?: ReactNode;
  className?: string;
}
