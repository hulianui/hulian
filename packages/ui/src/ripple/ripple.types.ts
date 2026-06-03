import type { ComponentPropsWithoutRef } from "react";

export interface RippleProps extends ComponentPropsWithoutRef<"div"> {
  /** 最内圈直径 px，默认 210 */
  mainCircleSize?: number;
  /** 最内圈不透明度，默认 0.24 */
  mainCircleOpacity?: number;
  /** 圈数，默认 8 */
  numCircles?: number;
}
