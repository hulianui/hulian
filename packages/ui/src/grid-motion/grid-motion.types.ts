import type { CSSProperties, ReactNode } from "react";

export interface GridMotionProps {
  /**
   * 网格单元内容数组。每项可为：
   * - 字符串：以 `http` 开头视为图片 URL（铺成背景图），否则当文字渲染；
   * - ReactNode：直接渲染（图标 / 自定义节点）。
   * 超过 行数×列数 的部分会被截断；不足则用占位文字「Item N」补齐。
   */
  items?: ReactNode[];
  /**
   * 网格行数，默认 4。每行作为一个独立的随鼠标视差平移单元（奇偶行反向）。
   */
  rows?: number;
  /**
   * 网格列数，默认 7。
   */
  columns?: number;
  /**
   * 中心径向光晕颜色（CSS 颜色），默认 `var(--color-primary)`。
   * 该色从画布中心向外渐隐，烘托整片网格的纵深感。
   */
  gradientColor?: string;
  /**
   * 鼠标横向移动时每行的最大平移幅度（px），默认 300。越大视差越夸张。
   */
  maxMoveAmount?: number;
  /**
   * 网格整体旋转角度（deg），默认 -15。营造透视斜切的动感。
   */
  rotate?: number;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
