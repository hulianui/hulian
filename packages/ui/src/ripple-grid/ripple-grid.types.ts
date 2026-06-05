import type { ReactNode } from "react";

export interface RippleGridProps {
  /**
   * 是否开启彩虹循环配色（忽略 color，随时间在 RGB 间渐变扫荡）。
   * 默认 false（用单一主题色 color）。
   */
  enableRainbow?: boolean;

  /**
   * 网格主色，CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 CSS 变量 `--color-chart-1` 取主题色，实现明暗自适应。
   * enableRainbow=true 时此项被忽略。
   */
  color?: string;

  /**
   * 涟漪扰动强度，默认 0.05。
   * 越大网格被同心波纹推挤得越剧烈；0 = 静止网格。
   */
  rippleIntensity?: number;

  /**
   * 网格密度，默认 10。
   * 越大格子越多越密，越小越疏。
   */
  gridSize?: number;

  /**
   * 网格线锐度（粗细的反向量），默认 15。
   * 越大线越细越锐利，越小线越粗越柔。
   */
  gridThickness?: number;

  /**
   * 中心向四周的距离淡出指数，默认 1.5。
   * 越大边缘衰减越快（网格更聚焦中心），越小铺得越满。
   */
  fadeDistance?: number;

  /**
   * 暗角强度，默认 2。
   * 越大四角压得越暗，0 = 无暗角。
   */
  vignetteStrength?: number;

  /**
   * 网格线发光强度，默认 0.1。
   * 越大线条外晕越亮，0 = 无辉光。
   */
  glowIntensity?: number;

  /**
   * 整体不透明度（0–1），默认 1。
   * 叠在内容下方时可调低做底纹。
   */
  opacity?: number;

  /**
   * 网格旋转角度（度），默认 0。
   * 例：45 = 菱形网格。
   */
  gridRotation?: number;

  /**
   * 是否启用鼠标交互（指针处额外激起一圈涟漪），默认 true。
   */
  mouseInteraction?: boolean;

  /**
   * 鼠标涟漪影响半径，默认 1。
   * 越大指针波及范围越广。
   */
  mouseInteractionRadius?: number;

  /**
   * 额外 className，透传到根容器（或 fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的静态网格底纹 div。
   */
  fallback?: ReactNode;
}
