import type { ComponentPropsWithoutRef } from "react";

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  /** 火花高光色，默认 var(--color-primary-foreground) */
  shimmerColor?: string;
  /** 火花宽度，默认 0.05em */
  shimmerSize?: string;
  /** 圆角，默认 var(--radius) */
  borderRadius?: string;
  /** 一轮火花秒数，默认 3s */
  shimmerDuration?: string;
  /** 按钮底色，默认 var(--color-primary) */
  background?: string;
}
