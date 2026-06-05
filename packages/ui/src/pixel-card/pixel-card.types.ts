import type { CSSProperties, ReactNode } from "react";

/** 预设变体名：不同的间距 / 速度 / 色板组合，开箱即用。 */
export type PixelCardVariant = "default" | "blue" | "pink" | "amber";

export interface PixelCardProps {
  /**
   * 预设变体，决定默认的 gap / speed / colors / noFocus 组合，默认 "default"。
   * - default：中性灰白像素（吃 foreground / muted token）
   * - blue：chart-2 蓝调
   * - pink：chart-5 粉调（默认关闭焦点触发）
   * - amber：chart-3 暖橙调，间距更密
   * 单独传 gap / speed / colors / noFocus 可覆盖变体对应项。
   */
  variant?: PixelCardVariant;
  /**
   * 像素网格间距（px），越小像素越密、数量越多（性能开销越大）。
   * 不传则取变体默认值。建议范围 3–12。
   */
  gap?: number;
  /**
   * 动画速度（0–100 的整数标度，内部按 0.001 节流换算成每帧增量）。
   * 0 等价于禁用动画；不传则取变体默认值。
   */
  speed?: number;
  /**
   * 像素配色数组，每个像素随机取其一。
   * 默认取瑚琏 token（var(--color-foreground) / var(--color-muted) 等，自动明暗适配）。
   * 可传任意 CSS 颜色字符串（hex / oklch / var(--color-…) 均可）。
   */
  colors?: string[];
  /**
   * 是否禁用键盘焦点触发动画（true 时仅鼠标悬停触发，且根容器不可聚焦）。
   * 不传则取变体默认值。
   */
  noFocus?: boolean;
  /**
   * 透传到根容器的额外 className（控制尺寸 / 圆角 / 边框等）。
   */
  className?: string;
  /**
   * 覆盖在像素层上方的内容，relative 层叠在 canvas 背景之上。
   */
  children?: ReactNode;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
