import type { ComponentPropsWithoutRef, ReactElement } from "react";
import type { EffectButtonSize } from "../button/button-base";

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * 尺寸档，与 [Button](../button/button.md) 的 sm/md/lg 一一对应（32/40/48px 高）。
   * 此前是写死的 `px-6 py-3`（按内容撑高），与普通 Button 混排会参差（#126）。
   */
  size?: EffectButtonSize;

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
  /**
   * 渲染为自定义元素（如 `<a>` / Next `<Link>`）而非 `<button>`，用于「闪光样式的链接」CTA。
   * 样式/内部火花结构会合并进该元素；文案仍取 ShimmerButton 的 children。
   */
  render?: ReactElement;
}
