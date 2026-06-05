import type { ReactNode } from "react";

export interface ButtonGroupProps {
  /** 主轴方向。@default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /**
   * 连排（true）= 子按钮贴合成一体（内侧圆角抹平、边框合并、hover 项浮起）；
   * 分离（false）= 子按钮间留 gap，仅作语义/对齐分组。
   * @default true
   */
  attached?: boolean;
  /** 子项间距档（仅 attached=false 生效）。@default "sm" */
  gap?: "sm" | "md";
  className?: string;
  /** 一般放若干 <Button>；也可混入 <Dropdown>/<Tooltip> 包裹的按钮。 */
  children?: ReactNode;
  "aria-label"?: string;
}
