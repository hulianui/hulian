import type { CSSProperties } from "react";

/** 网格滚动方向。 */
export type ShapeGridDirection = "right" | "left" | "up" | "down" | "diagonal";

/** 网格单元形状。 */
export type ShapeGridShape = "square" | "circle" | "triangle" | "hexagon";

export interface ShapeGridProps {
  /**
   * 网格滚动方向，默认 `"right"`。
   * - right/left：横向平移
   * - up/down：纵向平移
   * - diagonal：对角线平移
   */
  direction?: ShapeGridDirection;
  /**
   * 滚动速度（像素/帧，内部 clamp 下限 0.1），默认 1。
   * 越大滚动越快；reduced-motion 下强制静止（速度按 0 处理）。
   */
  speed?: number;
  /**
   * 单元边线颜色。默认吃 `var(--color-border)` token（自动明暗适配）。
   * 可传任意 CSS 颜色字符串（hex / oklch / rgb / var(--…)）。
   */
  borderColor?: string;
  /**
   * 单元边长（px），同时决定网格密度，默认 40。
   * hexagon 形以此为外接半径，triangle 以此为边长基准。
   */
  squareSize?: number;
  /**
   * 鼠标悬停时单元的填充色。默认吃 `var(--color-primary)` token。
   * 悬停淡入、移开淡出（缓动插值）。
   */
  hoverFillColor?: string;
  /**
   * 单元形状，默认 `"square"`。可选 square / circle / triangle / hexagon。
   */
  shape?: ShapeGridShape;
  /**
   * 悬停拖尾长度（保留多少个历史单元做渐隐拖尾），默认 0（无拖尾）。
   * 越大尾巴越长，透明度沿尾部线性衰减。
   */
  hoverTrailAmount?: number;
  /**
   * 透传到根 canvas 的额外 className。
   */
  className?: string;
  /**
   * 透传到根 canvas 的内联样式。
   */
  style?: CSSProperties;
}
