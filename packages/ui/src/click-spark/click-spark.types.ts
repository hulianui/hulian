import type { CSSProperties, ReactNode } from "react";

/** 火花线段的缓动曲线，决定火花飞出的加减速手感。 */
export type ClickSparkEasing = "linear" | "ease-in" | "ease-out" | "ease-in-out";

export interface ClickSparkProps {
  /**
   * 火花颜色，默认取瑚琏前景 token（自动吃明暗主题）。
   * 可传任意 CSS 颜色字符串（hex / oklch / var(--color-…) 均可）。
   * 注意：喂给 canvas strokeStyle 的 var() 必须带 --color- 前缀方能解析。
   * 默认：var(--color-foreground)
   */
  sparkColor?: string;
  /**
   * 单条火花线段的初始长度（px），越大越粗犷，默认 10。
   */
  sparkSize?: number;
  /**
   * 火花飞散的最大半径（px），决定爆发范围，默认 15。
   */
  sparkRadius?: number;
  /**
   * 一次点击放射出的火花数量（均分 360°），默认 8。
   */
  sparkCount?: number;
  /**
   * 单次火花动画时长（ms），越大越拖尾，默认 400。
   */
  duration?: number;
  /**
   * 火花飞出的缓动曲线，默认 "ease-out"（先快后慢，干脆利落）。
   */
  easing?: ClickSparkEasing;
  /**
   * 半径的额外缩放系数，>1 放大爆发、<1 收敛，默认 1。
   */
  extraScale?: number;
  /**
   * 透传到根容器的额外 className。根为 relative 定位的 DOM 元素。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
  /**
   * 包裹的内容，点击其内任意位置都会在点击点迸发火花。
   */
  children?: ReactNode;
}
