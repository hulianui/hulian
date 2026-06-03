import type { RefObject } from "react";

export interface AnimatedBeamProps {
  /** 容器（定位基准，须 position:relative）。 */
  containerRef: RefObject<HTMLElement | null>;
  /** 起点元素。 */
  fromRef: RefObject<HTMLElement | null>;
  /** 终点元素。 */
  toRef: RefObject<HTMLElement | null>;
  /** 曲率（>0 上凸）。 */
  curvature?: number;
  /** 光束反向流动。 */
  reverse?: boolean;
  /** 一趟时长(s)。 */
  duration?: number;
  delay?: number;
  /** 底线颜色（CSS 颜色，默认走 border token）。 */
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  /** 流光渐变两端色（默认 chart token）。 */
  gradientStartColor?: string;
  gradientStopColor?: string;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  className?: string;
}
