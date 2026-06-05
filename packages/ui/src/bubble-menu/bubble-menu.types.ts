import type { CSSProperties, ReactNode } from "react";

/** 单个菜单项悬停时的反色配置 */
export interface BubbleMenuItemHoverStyles {
  /** 悬停背景色（建议用 token，如 var(--color-chart-1)） */
  bgColor?: string;
  /** 悬停文字色 */
  textColor?: string;
}

/** 单个气泡菜单项 */
export interface BubbleMenuItem {
  /** 链接文案 */
  label: string;
  /** 跳转地址 */
  href: string;
  /** 无障碍标签（缺省回退到 label） */
  ariaLabel?: string;
  /** 桌面端胶囊的旋转角度（度），营造手作错落感；移动端自动归零 */
  rotation?: number;
  /** 悬停反色配置 */
  hoverStyles?: BubbleMenuItemHoverStyles;
}

export interface BubbleMenuProps {
  /** 左上角 logo 气泡内容：字符串当作图片 src，ReactNode 直接渲染 */
  logo?: ReactNode;
  /** 开合状态回调，参数为下一状态是否打开 */
  onMenuClick?: (isOpen: boolean) => void;
  /** 透传到根 nav 的额外类名 */
  className?: string;
  /** 透传到根 nav 的内联样式 */
  style?: CSSProperties;
  /** 切换按钮的无障碍标签 */
  menuAriaLabel?: string;
  /** true=fixed 定位（贴视口），false=absolute（贴最近定位父级） */
  useFixedPosition?: boolean;
  /** 菜单项列表，缺省用内置示例项 */
  items?: BubbleMenuItem[];
  /** 单个胶囊弹入动画时长（秒） */
  animationDuration?: number;
  /** 相邻胶囊之间的入场错峰延迟（秒） */
  staggerDelay?: number;
}
