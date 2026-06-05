import type { CSSProperties, ReactNode } from "react";

/** 单张 bento 卡片的数据。 */
export interface MagicBentoItem {
  /** 卡片小标签（顶部 muted 文案），如「Insights」。 */
  label?: ReactNode;
  /** 卡片标题。 */
  title?: ReactNode;
  /** 卡片描述（正文）。 */
  description?: ReactNode;
  /**
   * 自定义卡片内容；传入后覆盖 label/title/description 的默认布局，
   * 由你完全掌控卡片内部结构。
   */
  children?: ReactNode;
  /**
   * 网格跨列数（CSS grid column span），默认 1。
   * 用于拼出大小不一的 bento 布局。
   */
  colSpan?: number;
  /**
   * 网格跨行数（CSS grid row span），默认 1。
   */
  rowSpan?: number;
}

export interface MagicBentoProps {
  /**
   * 卡片数据数组。不传时渲染一组内置示例卡片（便于快速预览）。
   */
  items?: MagicBentoItem[];
  /**
   * 网格列数（CSS grid-template-columns 的份数），默认 4。
   * 各卡片再通过 colSpan/rowSpan 在此基础上跨格。
   */
  columns?: number;
  /**
   * 发光主色，喂给径向光晕 / 描边光。
   * 必须是可解析的 CSS 颜色；默认 var(--color-primary)。
   * 注意 Tailwind v4 下颜色变量须带 --color- 前缀（裸 var(--primary) 不解析）。
   */
  glowColor?: string;
  /**
   * 聚光半径（px），决定光晕扩散范围，默认 280。
   * 越大光斑越大、越柔。
   */
  spotlightRadius?: number;
  /**
   * 是否开启跟随光标的径向聚光（卡片内部高光随鼠标移动），默认 true。
   */
  enableSpotlight?: boolean;
  /**
   * 是否开启描边光（卡片边框随光标接近而点亮），默认 true。
   */
  enableBorderGlow?: boolean;
  /**
   * 是否开启 3D 倾斜（卡片随光标位置轻微 tilt），默认 false。
   * 关闭时卡片保持平面，仅有光晕反馈。
   */
  enableTilt?: boolean;
  /**
   * 强制关闭所有动画/交互（等价于 reduced-motion），默认 false。
   * 组件本身也会自动尊重系统 prefers-reduced-motion。
   */
  disableAnimations?: boolean;
  /** 透传到根网格容器的额外 className。 */
  className?: string;
  /** 透传到根网格容器的内联样式。 */
  style?: CSSProperties;
}
