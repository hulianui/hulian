import type { CSSProperties, ElementType, ReactNode } from "react";

export interface StarBorderProps {
  /**
   * 渲染的根标签，默认 "button"。
   * 多态：可传 "a" / "div" / 任意组件，DOM 属性会透传到该元素。
   */
  as?: ElementType;
  /**
   * 流星光带颜色，默认取瑚琏 token `var(--color-primary)`（自动吃明暗主题）。
   * 可传任意 CSS 颜色字符串（hex / oklch / var(--…) 均可），会喂进 radial-gradient。
   */
  color?: string;
  /**
   * 单趟流星扫过时长（秒），默认 6。
   * 越大越慢、越克制；越小越活跃。reduced-motion 下自动停。
   */
  speed?: number;
  /**
   * 边框光带厚度（px），默认 1。撑开根容器上下内边距，决定描边粗细。
   */
  thickness?: number;
  /**
   * 透传到根容器的额外 className（合并，可覆盖圆角 / 间距等）。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
  /**
   * 按钮 / 容器内的内容。
   */
  children?: ReactNode;
}
