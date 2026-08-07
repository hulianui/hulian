import type { ComponentPropsWithoutRef } from "react";
import type { EffectButtonSize } from "../button/button-base";

export interface RippleButtonProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * 尺寸档，与 [Button](../button/button.md) 的 sm/md/lg 一一对应（32/40/48px 高）。
   * 此前是写死的 `px-6 py-3`（按内容撑高），与普通 Button 混排会参差（#126）。
   */
  size?: EffectButtonSize;

  /** 波纹色，默认 var(--color-primary-foreground) */
  rippleColor?: string;
  /** 单次波纹时长，默认 600ms */
  duration?: string;
}
