import type { CSSProperties, ReactNode } from "react";

export interface ReflectiveCardProps {
  /**
   * 卡片标题（大字号主标题），如人名 / 卡名。
   * 留空则不渲染标题行。
   */
  title?: ReactNode;
  /**
   * 卡片副标题（标题下方的小字说明），如职位 / 等级。
   */
  subtitle?: ReactNode;
  /**
   * 卡头左侧徽标文案（默认配 lucide 锁图标），如 "SECURE ACCESS"。
   * 传 null 可隐藏整个卡头徽标区。
   */
  badge?: ReactNode;
  /**
   * 卡尾左侧的标注文案（小灰字 label），如 "ID NUMBER"。
   */
  footerLabel?: ReactNode;
  /**
   * 卡尾左侧的值文案（等宽字体），如 "8901-2345-6789"。
   */
  footerValue?: ReactNode;
  /**
   * 自定义卡片主体内容。传入后将完全替换内置的「标题 / 副标题 / 卡头 / 卡尾」布局，
   * 仅保留金属反光背景层与边框。
   */
  children?: ReactNode;
  /**
   * 金属高光主色，喂给反光层渐变。默认 var(--color-foreground)（吃明暗主题）。
   * 可传任意 CSS 颜色（hex / oklch / var(--color-…) 均可）。
   */
  sheenColor?: string;
  /**
   * 卡片底色基调，决定金属表面的暗部色。默认 var(--color-chart-1)。
   */
  baseColor?: string;
  /**
   * 高光横扫一轮的动画时长（秒），默认 6。越大越慢越细腻。
   */
  speed?: number;
  /**
   * 表面噪点（磨砂质感）强度 0–1，默认 0.35。0 = 镜面无颗粒，1 = 重磨砂。
   */
  roughness?: number;
  /**
   * 金属反光层整体强度（不透明度）0–1，默认 1。调低让卡面更内敛。
   */
  metalness?: number;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
