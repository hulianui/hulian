import type { ComponentPropsWithoutRef } from "react";

export interface RetroGridProps extends ComponentPropsWithoutRef<"div"> {
  /** 透视倾斜角度（度），默认 65 */
  angle?: number;
  /** 网格单元像素，默认 60 */
  cellSize?: number;
  /** 整体不透明度，默认 0.5 */
  opacity?: number;
  /** 滚动一轮秒数，默认 12（越大越慢） */
  duration?: number;
}
