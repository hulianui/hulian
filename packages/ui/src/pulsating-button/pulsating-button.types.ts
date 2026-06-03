import type { ComponentPropsWithoutRef } from "react";

export interface PulsatingButtonProps extends ComponentPropsWithoutRef<"button"> {
  /** 脉冲光环色，默认 var(--color-primary) 的 70% */
  pulseColor?: string;
  /** 一轮脉冲秒数，默认 1.5s */
  duration?: string;
}
