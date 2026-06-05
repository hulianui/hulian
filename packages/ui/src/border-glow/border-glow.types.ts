import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface BorderGlowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /**
   * 卡片内容，渲染在发光边框内部（relative 层叠在所有发光层之上）。
   */
  children?: ReactNode;
  /**
   * 透传到根容器的额外 className（合并进 .border-glow 卡片）。
   */
  className?: string;
  /**
   * 边缘灵敏度（0–100），越小越早触发外层光晕，默认 30。
   * 指针越靠近卡片边缘，edge proximity 越接近 100；超过该阈值后外层光晕开始显现。
   */
  edgeSensitivity?: number;
  /**
   * 外层光晕颜色，喂给 box-shadow 的发光色。
   * 接受任意 CSS 颜色（hex / oklch / rgb / `var(--color-…)`），默认取瑚琏 chart-1 token，自动吃明暗。
   * 注意：传 token 时必须带 `--color-` 前缀（Tailwind v4 真名），裸 `var(--primary)` 不解析。
   */
  glowColor?: string;
  /**
   * 卡片底色，默认深色（`var(--color-surface)` 之上的暗调）。
   * 发光边框依赖深底对比，浅底下效果会变弱。
   */
  backgroundColor?: string;
  /**
   * 圆角半径（px），默认 28。
   */
  borderRadius?: number;
  /**
   * 外层光晕向外溢出的内边距（px），越大光晕扩散越远，默认 40。
   */
  glowRadius?: number;
  /**
   * 光晕整体强度倍率（0–2），默认 1，作用在各档发光透明度上。
   */
  glowIntensity?: number;
  /**
   * 光锥角度宽度（0–50），越大边框高亮弧越宽，默认 25。
   */
  coneSpread?: number;
  /**
   * 是否在挂载时自动播放一圈"扫光"动画（无需指针），默认 false。
   * 受 reduced-motion 影响：用户偏好减少动画时自动跳过扫光（DOM 不变）。
   */
  animated?: boolean;
  /**
   * 彩色网格边框的取色，循环映射到 7 个 radial-gradient 锚点。
   * 默认取瑚琏 chart token（chart-1/3/4），自动吃明暗主题。
   */
  colors?: string[];
  /**
   * 边缘彩色填充层的透明度（0–1），默认 0.5。
   */
  fillOpacity?: number;
  /**
   * 透传到根容器的内联样式（与内部 CSS 变量合并）。
   */
  style?: CSSProperties;
}
