import type { CSSProperties, ReactNode } from "react";

/** 卡片导航中单条链接 */
export interface CardNavLink {
  /** 链接文案 */
  label: string;
  /** 跳转地址，默认 "#" */
  href?: string;
  /** 无障碍标签，缺省时回退到 label */
  ariaLabel?: string;
}

/** 卡片导航中单张卡片（展开后逐张错峰浮现，最多取前 3 张对齐原作） */
export interface CardNavItem {
  /** 卡片大标题 */
  label: string;
  /** 卡片内的链接列表 */
  links?: CardNavLink[];
  /**
   * 卡片底色，传入任意 CSS 颜色字符串。
   * 缺省时吃瑚琏 token bg-surface（自动随明暗主题）。
   * 建议用 var(--color-chart-1..5) 做品牌色块。
   */
  bgColor?: string;
  /**
   * 卡片文字色，缺省时吃 token text-foreground。
   */
  textColor?: string;
}

export interface CardNavProps {
  /**
   * 品牌区内容（通常是 logo / 文字标题）。
   * 居中显示在顶栏，传 ReactNode 而非原作的 img src，更灵活。
   */
  brand?: ReactNode;
  /**
   * 卡片数据，展开后渲染为一排（移动端为一列）卡片，最多取前 3 张。
   */
  items: CardNavItem[];
  /**
   * 右侧 CTA 按钮文案，默认 "Get Started"。
   * 传空字符串或 null 可隐藏按钮。
   */
  ctaLabel?: ReactNode;
  /** CTA 按钮点击回调 */
  onCtaClick?: () => void;
  /**
   * 展开/收起动画时长（秒），默认 0.4。
   * reduced-motion 下自动归零（DOM 两态一致，仅去动效）。
   */
  duration?: number;
  /**
   * 受控展开态。传入则由外部接管开合，需配合 onOpenChange 使用。
   */
  open?: boolean;
  /** 展开态变更回调（受控/非受控均触发） */
  onOpenChange?: (open: boolean) => void;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
