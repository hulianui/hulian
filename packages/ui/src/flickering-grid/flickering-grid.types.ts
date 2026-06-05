import type { HTMLAttributes } from "react";

export interface FlickeringGridProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 每个方格的边长（px），默认 4。
   * 影响网格密度：值越小方格越密。
   */
  squareSize?: number;
  /**
   * 方格间距（px），默认 6。
   */
  gridGap?: number;
  /**
   * 每帧每个方格随机闪烁的概率（乘以 deltaTime），默认 0.3。
   * 0 = 静态网格；1 = 高频闪烁。
   */
  flickerChance?: number;
  /**
   * 方格颜色，支持任意 CSS 颜色字符串。
   * 默认不传时，组件从容器的 `color` 或 CSS 变量 `--color-foreground` 解析 RGB，
   * 自动跟随明暗主题。
   */
  color?: string;
  /**
   * 固定宽度（px）。不传时用 ResizeObserver 跟随容器宽。
   */
  width?: number;
  /**
   * 固定高度（px）。不传时用 ResizeObserver 跟随容器高。
   */
  height?: number;
  /**
   * 方格最大不透明度（0~1），默认 0.3。
   * 数值越高网格越明显。
   */
  maxOpacity?: number;
}
