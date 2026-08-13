import type { ComponentPropsWithoutRef, ReactElement } from "react";
import type { EffectButtonSize } from "../button/button-base";

export interface RainbowButtonProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * 尺寸档，与 [Button](../button/button.md) 的 sm/md/lg 一一对应（32/40/48px 高）。
   * 此前是写死的 `px-6 py-3`（按内容撑高），与普通 Button 混排会参差（#126）。
   */
  size?: EffectButtonSize;

  /** 彩虹流动一轮秒数，默认 3s */
  speed?: string;

  /**
   * 渲染为自定义元素（如 `<a>` / Next `<Link>`）而非 `<button>`，用于「彩虹样式的链接」CTA。
   * 样式与内部光晕层会合并进该元素；文案仍取本组件的 `children`。
   */
  render?: ReactElement;
}
