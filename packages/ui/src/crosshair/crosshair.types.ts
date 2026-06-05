import type { CSSProperties } from "react";

export interface CrosshairProps {
  /**
   * 准星十字线颜色，默认取瑚琏 `var(--color-primary)`（自动吃明暗主题）。
   * 可传任意 CSS 颜色字符串（hex / oklch / var(--…) 均可）；
   * 推荐用 token：`var(--color-primary)` / `var(--color-chart-1)` / `var(--color-foreground)`。
   */
  color?: string;
  /**
   * 跟随平滑系数（0–1），越小越「黏」越拖尾，越大越跟手，默认 0.15。
   * 用于每帧 lerp 插值：previous += (target - previous) * smoothing。
   */
  smoothing?: number;
  /**
   * 十字线粗细（px），默认 1。
   */
  thickness?: number;
  /**
   * 进入容器时触发的一次「抖动脉冲」（吸取自 React Bits 原作 link hover 的
   * feTurbulence 噪声位移，瑚琏化为零依赖的 CSS scale 脉冲）。默认 true。
   * reduced-motion 下自动失效，跟随仍保留。
   */
  pulseOnEnter?: boolean;
  /**
   * 透传到根容器的额外 className。根容器须为定位上下文（组件内部已置 absolute inset-0 铺满父级）。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
