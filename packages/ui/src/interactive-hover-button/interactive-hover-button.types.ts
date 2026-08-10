import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import type { EffectButtonSize } from "../button/button-base";

export interface InteractiveHoverButtonProps extends ComponentPropsWithoutRef<"button"> {
  /** 尺寸档，与 [Button](../button/button.md) 的 sm/md/lg 一一对应（32/40/48px 高）。 */
  size?: EffectButtonSize;

  /** 展开后的底色，默认 `var(--color-primary)`。 */
  background?: string;

  /** 展开后的文字色，默认 `var(--color-primary-foreground)`。 */
  foreground?: string;

  /** 静息态那颗小圆点的颜色，默认与 `background` 同色。 */
  dotColor?: string;

  /** 展开动画时长，默认 `0.4s`。 */
  duration?: string;

  /**
   * 悬停层右侧的尾随图标，默认是一枚右箭头。传 `null` 去掉它。
   * 图标是装饰：整层已 `aria-hidden`，按钮名由 `children` 承载。
   */
  icon?: ReactNode;

  /**
   * 渲染为自定义元素（如 `<a>` / Next `<Link>`）而非 `<button>`，用于「落地页主 CTA 是个链接」。
   * 样式与内部两层结构会合并进该元素；文案仍取本组件的 `children`。
   */
  render?: ReactElement;
}
