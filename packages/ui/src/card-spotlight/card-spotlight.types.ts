import type { HTMLAttributes, ReactNode } from "react";

export interface CardSpotlightProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 聚光灯半径（px），默认 350。
   * 值越大高光扩散越广，值越小越聚焦。
   */
  radius?: number;
  /**
   * 聚光高光色，默认使用 chart-1 token（带透明度）。
   * 支持任意 CSS 颜色字符串，如 "#7c3aed"、"hsl(260 80% 60%)"、"var(--color-primary)"。
   */
  color?: string;
  /** 卡片内容 */
  children: ReactNode;
}
