import type { ComponentPropsWithoutRef } from "react";

export interface DotPatternProps extends ComponentPropsWithoutRef<"svg"> {
  /** 平铺单元宽，默认 16 */
  width?: number;
  /** 平铺单元高，默认 16 */
  height?: number;
  /** 点在单元内的 x 偏移，默认 1 */
  cx?: number;
  /** 点在单元内的 y 偏移，默认 1 */
  cy?: number;
  /** 点半径，默认 1 */
  cr?: number;
  /** pattern 整体 x 偏移，默认 0 */
  x?: number;
  /** pattern 整体 y 偏移，默认 0 */
  y?: number;
}
