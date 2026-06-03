import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface SparklesTextProps extends Omit<ComponentPropsWithoutRef<"span">, "color"> {
  children: ReactNode;
  /** 星色数组，默认 [primary, chart-1] token */
  colors?: string[];
  /** 星星数量，默认 8 */
  sparklesCount?: number;
}
