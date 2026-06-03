import type { HTMLAttributes, ReactNode } from "react";

export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 自定义插画/图标；不传用内置空箱图标。传 null 则不渲染图标区。 */
  icon?: ReactNode;
  /** 主标题。 */
  title?: ReactNode;
  /** 辅助描述。 */
  description?: ReactNode;
  /** 尺寸。@default "md" */
  size?: "sm" | "md";
  /** 操作区（按钮等），渲染在描述下方。 */
  children?: ReactNode;
}
