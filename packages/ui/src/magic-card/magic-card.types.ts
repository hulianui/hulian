import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface MagicCardProps extends ComponentPropsWithoutRef<"div"> {
  children?: ReactNode;
  /** 高光半径 px，默认 200 */
  gradientSize?: number;
  /** 高光色，默认 var(--color-primary) */
  gradientColor?: string;
  /** 高光不透明度，默认 0.15 */
  gradientOpacity?: number;
}
