import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface AuroraTextProps extends Omit<ComponentPropsWithoutRef<"span">, "color"> {
  children: ReactNode;
  /** 渐变停靠色数组，默认 4 个瑚琏 chart token（自动吃明暗主题） */
  colors?: string[];
  /** 流动速度倍率，默认 1（越大越快） */
  speed?: number;
}
