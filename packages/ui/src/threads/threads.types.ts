import type { ReactNode } from "react";

export interface ThreadsProps {
  /**
   * 丝线颜色。
   *
   * 支持两种格式：
   * - `[r, g, b]` 数字数组，每分量 0–1（与 react-bits 原版一致）
   * - 任意 CSS 颜色字符串（hex / oklch / rgb() / `var(--token)` 均可）
   *
   * 不传时从 canvas 继承的 `--color-chart-1` token 自动解析，适配明暗主题。
   */
  color?: [number, number, number] | string;
  /**
   * 波动幅度，默认 1。
   * 越大丝线摆幅越剧烈，建议范围 0.3–3。
   */
  amplitude?: number;
  /**
   * 各丝线间的纵向间距缩放，默认 0。
   * 正值拉开各线纵向间距，负值压缩；建议范围 -1–2。
   */
  distance?: number;
  /**
   * 是否启用鼠标跟随交互，默认 true。
   * 启用后鼠标 X 影响时间流速，Y 影响振幅强度，带 0.05 平滑插值。
   */
  enableMouseInteraction?: boolean;
  /**
   * 透传到 canvas 元素的额外 className（或 fallback div）。
   */
  className?: string;
  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认展示几条 CSS 渐变线，吃 chart token。
   * 传 `null` 可完全隐藏降级占位。
   */
  fallback?: ReactNode;
}
