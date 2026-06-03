import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface AnimatedGradientTextProps extends Omit<ComponentPropsWithoutRef<"span">, "color"> {
  children: ReactNode;
  /** 渐变停靠色数组，默认瑚琏 chart token */
  colors?: string[];
  /** 流动速度倍率，默认 1 */
  speed?: number;
}
