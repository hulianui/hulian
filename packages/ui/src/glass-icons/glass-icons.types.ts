import type { CSSProperties, ReactNode } from "react";

/**
 * 单个玻璃图标项。
 */
export interface GlassIconItem {
  /**
   * 图标内容，通常传 lucide-react 图标节点，如 `<Heart />`。
   * 渲染在玻璃前层中央，`aria-hidden`。
   */
  icon: ReactNode;
  /**
   * 标签文案，既作 hover/focus 时滑出的文字，也作按钮 `aria-label`（无障碍名）。
   */
  label: string;
  /**
   * 背面发光层的配色。可传：
   * - 预设语义名：`"primary" | "blue" | "purple" | "red" | "indigo" | "orange" | "green"`
   *   （映射到瑚琏 chart token / primary，自动吃明暗主题）；
   * - 任意 CSS 颜色或渐变字符串（如 `"var(--color-chart-3)"`、`"linear-gradient(...)"`）。
   * 默认 `"primary"`。
   */
  color?: string;
  /**
   * 透传到该按钮的额外 className。
   */
  className?: string;
  /**
   * 点击回调。
   */
  onClick?: () => void;
}

export interface GlassIconsProps {
  /**
   * 图标项列表，按网格依次渲染为玻璃拟态按钮。
   */
  items: GlassIconItem[];
  /**
   * 网格列数，默认 3。响应式下窄屏会自动回落到更少列。
   */
  columns?: number;
  /**
   * 透传到根网格容器的额外 className（可覆盖列数/间距/对齐）。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
