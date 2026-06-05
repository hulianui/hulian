import type { ReactNode } from "react";

/** 形状预设：决定渲染哪种 SDF 几何体。 */
export type ShapeBlurVariation =
  | "round-rect" // 0 · 圆角矩形描边
  | "circle-fill" // 1 · 实心圆
  | "circle-stroke" // 2 · 圆环描边
  | "triangle"; // 3 · 三角形填充

export interface ShapeBlurProps {
  /**
   * 形状预设，默认 `"round-rect"`（圆角矩形描边）。
   * - `round-rect` 圆角矩形描边 · `circle-fill` 实心圆
   * - `circle-stroke` 圆环描边 · `triangle` 三角形填充
   *
   * 鼠标靠近时，跟随的柔光圆会"擦亮"形状边缘，形成模糊揭示效果。
   */
  variation?: ShapeBlurVariation;

  /**
   * 形状整体尺寸，默认 1.2。
   * 直接映射到 GLSL uniform `u_shapeSize`，值越大形状越大。
   */
  shapeSize?: number;

  /**
   * 圆角程度，默认 0.4，仅 `round-rect` 生效。
   * 映射到 `u_roundness`，0 = 直角，越大越圆。
   */
  roundness?: number;

  /**
   * 描边宽度，默认 0.05，仅描边类预设（`round-rect` / `circle-stroke`）生效。
   * 映射到 `u_borderSize`。
   */
  borderSize?: number;

  /**
   * 跟随鼠标的柔光圆半径，默认 0.3。
   * 映射到 `u_circleSize`，决定"擦亮"区域的大小。
   */
  circleSize?: number;

  /**
   * 柔光圆边缘羽化程度，默认 0.5。
   * 映射到 `u_circleEdge`，越大边缘越柔。
   */
  circleEdge?: number;

  /**
   * 形状主色，CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 CSS 变量 `--color-foreground` 取主题前景色，明暗自适应。
   */
  color?: string;

  /**
   * 鼠标跟随的阻尼系数，默认 8，越大跟随越快、越小越"懒"。
   * 用于柔光圆的临界阻尼缓动（指数衰减）。
   */
  damping?: number;

  /**
   * 额外 className，透传到 root 容器 div。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 foreground token 的柔和径向光晕装饰 div。
   */
  fallback?: ReactNode;
}
