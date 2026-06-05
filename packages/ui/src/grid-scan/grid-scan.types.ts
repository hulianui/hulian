import type { ReactNode } from "react";

/** 网格线条样式：实线 / 虚线 / 点线。 */
export type GridScanLineStyle = "solid" | "dashed" | "dotted";

/** 扫描带运动方向：向前推进 / 向后回退 / 来回往返。 */
export type GridScanDirection = "forward" | "backward" | "pingpong";

export interface GridScanProps {
  /**
   * 网格线条颜色，CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 CSS 变量 `--color-border` 取主题色，实现明暗自适应。
   */
  linesColor?: string;

  /**
   * 扫描带发光颜色，CSS 颜色字符串。
   * 默认从 CSS 变量 `--color-primary` 取品牌主色，扫描脉冲随之发光。
   */
  scanColor?: string;

  /**
   * 网格密度（格子缩放），默认 0.1。
   * 值越小格子越密，值越大格子越疏。建议范围 0.05–0.3。
   */
  gridScale?: number;

  /**
   * 网格线粗细（屏幕像素），默认 1。
   * 直接映射到 GLSL uniform，越大线越粗。
   */
  lineThickness?: number;

  /**
   * 线条样式：`solid` 实线 / `dashed` 虚线 / `dotted` 点线，默认 `solid`。
   */
  lineStyle?: GridScanLineStyle;

  /**
   * 扫描带发光不透明度（0–1），默认 0.45。
   * 0 = 无扫描脉冲（纯网格），1 = 扫描带最亮。
   */
  scanOpacity?: number;

  /**
   * 扫描带运动方向，默认 `pingpong`（来回往返）。
   * `forward` 由远及近、`backward` 由近及远、`pingpong` 往返循环。
   */
  scanDirection?: GridScanDirection;

  /**
   * 单趟扫描时长（秒），默认 2。越大扫描越慢、越从容。
   */
  scanDuration?: number;

  /**
   * 两趟扫描之间的停顿（秒），默认 2。`pingpong` 时仅影响起步延迟。
   */
  scanDelay?: number;

  /**
   * 扫描带柔化程度（高斯宽度倍率），默认 2。越大光带越宽越柔。
   */
  scanSoftness?: number;

  /**
   * 颗粒噪声强度，默认 0.01。给画面叠加细微数字噪点，0 = 干净无噪点。
   */
  noiseIntensity?: number;

  /**
   * 是否随鼠标移动产生轻微透视偏摆，默认 true。
   * reduced-motion / 无 WebGL 时自动失效。
   */
  parallax?: boolean;

  /**
   * 额外 className，透传到根容器（或 fallback div）。
   */
  className?: string;

  /**
   * 覆盖在网格背景上方的内容，通过 relative z-10 层叠在扫描网格之上。
   * 注意：组件根为 absolute 背景层，children 会渲染在它内部并提升 z 轴层级。
   */
  children?: ReactNode;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 token 的等距网格静态底纹。
   */
  fallback?: ReactNode;
}
