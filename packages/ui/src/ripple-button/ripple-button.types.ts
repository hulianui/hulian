import type { ComponentPropsWithoutRef } from "react";

export interface RippleButtonProps extends ComponentPropsWithoutRef<"button"> {
  /** 波纹色，默认 var(--color-primary-foreground) */
  rippleColor?: string;
  /** 单次波纹时长，默认 600ms */
  duration?: string;
}
