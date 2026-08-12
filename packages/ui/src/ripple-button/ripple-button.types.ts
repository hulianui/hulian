import type { ComponentPropsWithoutRef } from "react";
import type { EffectButtonSize } from "../button/button-base";

/**
 * 外观档，取值是 [Button](../button/button.md) 的 `variant` **减去 `link`**。
 *
 * 少 `link` 的判据是「波纹要有盒子」：`link` 那一档专门去掉高度与横向内边距，回归纯文字链接，
 * 而波纹是从点击落点向外扩散、由 `overflow-hidden` 裁在按钮盒子里的——落在一个 `h-auto px-0`
 * 的文字上，波纹要么裁成一条缝要么整片糊住文字。想要「链接样式 + 点击反馈」请用 `Button variant="link"`。
 */
export type RippleButtonVariant = "solid" | "outline" | "ghost" | "soft";

/**
 * 语气色，取值是 Button 的 `tone` **减去 `current`**。
 *
 * 少 `current` 的判据是「波纹色要有确定的值」：`current` 的意思是「别设色、跟随容器继承」，
 * 而本件要按 tone 推导波纹的默认颜色（见 `rippleColor`），继承色推不出来。
 * 真要跟随容器请自己传 `rippleColor="currentColor"` 并用 `className` 定文字色。
 */
export type RippleButtonTone = "brand" | "neutral" | "success" | "warning" | "danger";

export interface RippleButtonProps extends ComponentPropsWithoutRef<"button"> {
  /**
   * 尺寸档，与 [Button](../button/button.md) 的 sm/md/lg 一一对应（32/40/48px 高）。
   * 此前是写死的 `px-6 py-3`（按内容撑高），与普通 Button 混排会参差（#126）。
   */
  size?: EffectButtonSize;

  /**
   * 外观档，与 Button 的同名档同色（#233）。默认 `"solid"`。
   * 此前底色写死主色实心，「想要涟漪反馈、但外观是描边 / 幽灵 / 危险色」的按钮一个都接不住，
   * 消费方 12 处调用无一例外都在从外面注入一整套 `buttonVariants()`。
   */
  variant?: RippleButtonVariant;

  /**
   * 语气色，与 Button 的同名档同色（#233）。默认 `"brand"`。
   * `variant="outline"` 上语气色作用于描边与文字，`ghost` 上只作用于文字。
   */
  tone?: RippleButtonTone;

  /**
   * 波纹色。默认按 `variant` × `tone` 推导：实心档取该 tone 的前景色（深底上的浅波纹），
   * 其余档取该 tone 的本色（浅底上的同色波纹）。传值即覆盖推导结果。
   */
  rippleColor?: string;
  /** 单次波纹时长，默认 600ms */
  duration?: string;
}
