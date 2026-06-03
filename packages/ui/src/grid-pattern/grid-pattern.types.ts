import type { ComponentPropsWithoutRef } from "react";

export interface GridPatternProps extends ComponentPropsWithoutRef<"svg"> {
  /** 单元宽，默认 40 */
  width?: number;
  /** 单元高，默认 40 */
  height?: number;
  /** pattern x 偏移，默认 0 */
  x?: number;
  /** pattern y 偏移，默认 0 */
  y?: number;
  /** 线虚线模式，默认 0（实线）。传 "4 2" 即虚线 */
  strokeDasharray?: string | number;
}
