import type { CSSProperties, ReactNode } from "react";

export interface AuroraProps {
  /**
   * 极光色带，默认取瑚琏 chart token（自动吃明暗主题）。
   * 可传任意 CSS 颜色字符串（hex / oklch / var(--…) 均可）。
   * 默认：["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-4)"]
   */
  colors?: string[];
  /**
   * 极光层模糊半径（px），越大越柔和，默认 30。
   * 建议范围 10–80；过小色带边缘过硬，过大效果消散。
   */
  blur?: number;
  /**
   * 完整一轮动画时长（秒），默认 20。
   * 越大越慢，效果越细腻；越小越活跃。
   */
  speed?: number;
  /**
   * 是否开启径向渐隐 mask（聚焦中部，四角淡出），默认 true。
   * 关闭后极光填满整个容器、无渐隐。
   */
  showRadialMask?: boolean;
  /**
   * 透传到极光层 div 的额外 className（覆盖容器，也可用于调整透明度/混合模式）。
   */
  className?: string;
  /**
   * 覆盖在极光上方的内容，通过 relative 定位层叠在极光背景之上。
   */
  children?: ReactNode;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
