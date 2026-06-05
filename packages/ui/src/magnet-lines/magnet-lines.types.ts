import type { CSSProperties } from "react";

export interface MagnetLinesProps {
  /**
   * 网格行数，默认 9。
   * 与 columns 相乘即为线段总数（默认 9×9 = 81 条）。
   */
  rows?: number;
  /**
   * 网格列数，默认 9。
   */
  columns?: number;
  /**
   * 容器尺寸（任意 CSS 长度），默认 "80vmin"。
   * 容器为正方形，rows×columns 的线段在其中等分铺开。
   */
  containerSize?: string;
  /**
   * 线段颜色，默认吃瑚琏 token "var(--color-foreground)"（自动明暗适配）。
   * 可传任意 CSS 颜色字符串（hex / oklch / var(--…) 均可）。
   */
  lineColor?: string;
  /**
   * 单条线段宽度（任意 CSS 长度），默认 "1vmin"。
   */
  lineWidth?: string;
  /**
   * 单条线段高度（任意 CSS 长度），默认 "6vmin"。
   */
  lineHeight?: string;
  /**
   * 初始静止角度（度），默认 -10。
   * 指针未移动或开启了 reduced-motion 时，所有线段保持该角度。
   */
  baseAngle?: number;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式（会与组件计算出的 grid 样式合并，后写覆盖）。
   */
  style?: CSSProperties;
}
