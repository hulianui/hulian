import type { CSSProperties } from "react";

export interface SplashCursorProps {
  /**
   * 是否启用彩虹模式：开启时每次溅射的颜色沿 HSV 色相轮缓慢循环（同原版 RAINBOW_MODE）。
   * 默认 `true`。关闭后所有溅射统一使用 `color`（或其默认 chart token）。
   */
  rainbow?: boolean;
  /**
   * 非彩虹模式下的固定溅射颜色，任意 CSS 颜色字符串（hex / rgb / oklch / var(--color-…) 均可）。
   * 默认读取 `--color-chart-1` token（自动吃明暗主题）。
   * 彩虹模式开启时此值被忽略。
   */
  color?: string;
  /**
   * 溅射半径基准（px），越大色斑越饱满。默认 56。
   * 对应原版 SPLAT_RADIUS，瑚琏侧改为直观的像素尺度。
   */
  splatRadius?: number;
  /**
   * 溅射力度：决定色斑随指针速度抛洒的位移幅度与拖尾长度。默认 1。
   * 越大拖尾越长、扩散越猛；建议 0.5–2。
   */
  splatForce?: number;
  /**
   * 色斑消散速度（每秒衰减比例，0–1），越大消散越快。默认 0.92。
   * 对应原版 DENSITY_DISSIPATION 的语义反向（这里是"保留率"，越接近 1 越持久）。
   */
  dissipation?: number;
  /**
   * 整体不透明度（0–1），叠在内容下方时可调暗以免喧宾夺主。默认 1。
   */
  opacity?: number;
  /**
   * 透传到根容器（占满父级 `absolute inset-0`）的额外 className。
   * 父级需 `relative`；本组件自带 `pointer-events-none` 不拦截交互。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
