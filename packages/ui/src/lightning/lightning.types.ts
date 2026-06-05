import type { ReactNode } from "react";

export interface LightningProps {
  /**
   * 闪电色相（0–360，HSV 色环角度），默认 230（偏蓝紫）。
   * 仅在未传 `color` 时生效——用经典 hsv2rgb 路径上色，对应原版 React Bits 行为。
   * 例：30 暖橙、120 青绿、280 品紫。
   */
  hue?: number;

  /**
   * 闪电主色（CSS 颜色字符串：hex / oklch / rgb / var(--…) 均可）。
   * 传入后覆盖 `hue` 的 HSV 路径，shader 直接吃该色，便于与品牌/主题对齐。
   * 默认 undefined → 不取 token，走 `hue` 色相（保留原版观感）。
   * 传 "var(--color-chart-1)" 可让闪电吃 chart token、明暗自适应。
   */
  color?: string;

  /**
   * 水平偏移（clip-space 单位），默认 0。
   * 正值把闪电主干推向右侧，负值推向左侧。
   */
  xOffset?: number;

  /**
   * 动画速度因子，越大闪烁/翻涌越快，默认 1。
   * 映射到 GLSL uniform uSpeed（驱动 fbm 漂移 + 随机闪烁强度）。
   */
  speed?: number;

  /**
   * 辉度强度，越大闪电越亮越粗，默认 1。
   * 映射到 GLSL uniform uIntensity。
   */
  intensity?: number;

  /**
   * 噪声尺度，越大分叉越细密，越小越宏观，默认 1。
   * 映射到 GLSL uniform uSize（fbm 采样频率）。
   */
  size?: number;

  /**
   * 额外 className，透传到根容器 div（reduced / WebGL 失败时透传到 fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的纵向辉光 linear-gradient 装饰 div（保留"闪电柱"暗示）。
   */
  fallback?: ReactNode;
}
