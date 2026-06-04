import type { ComponentPropsWithoutRef } from "react";

export interface SpotlightProps extends ComponentPropsWithoutRef<"div"> {
  /** 辉光色，默认品牌色 var(--color-primary)；可传任意 CSS 颜色/变量（如 var(--color-success)）。 */
  color?: string;
  /** 辉光强度：辉光中心与底色 color-mix 的百分比，越大越亮。@default 14 */
  intensity?: number;
  /** 辉光中心 X 位置。@default "50%" */
  x?: string;
  /** 辉光中心 Y 位置。@default "0%"（顶部） */
  y?: string;
  /** 辉光椭圆尺寸（径向渐变的范围）。@default "125%" */
  size?: string;
  /** 渐隐到底色的位置百分比，越小辉光越聚拢。@default 55 */
  fade?: number;
}
