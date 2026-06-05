import type { CSSProperties, ReactNode } from "react";

/** 单个 logo 项：图片型（src 等）或节点型（任意 ReactNode），二选一。 */
export type LogoItem =
  | {
      /** 图片地址。 */
      src: string;
      /** 响应式图源（srcSet）。 */
      srcSet?: string;
      /** 响应式尺寸提示（sizes）。 */
      sizes?: string;
      /** 图片宽度（px）。 */
      width?: number;
      /** 图片高度（px），缺省时由 logoHeight 控制。 */
      height?: number;
      /** 替代文本，无障碍必填（缺省退化为空串）。 */
      alt?: string;
      /** 鼠标悬停提示。 */
      title?: string;
      /** 点击跳转地址，存在时整项包裹为链接。 */
      href?: string;
    }
  | {
      /** 自定义节点（图标 / SVG / 文案徽标等）。 */
      node: ReactNode;
      /** 链接的无障碍标签。 */
      ariaLabel?: string;
      /** 鼠标悬停提示。 */
      title?: string;
      /** 点击跳转地址，存在时整项包裹为链接。 */
      href?: string;
    };

export interface LogoLoopProps {
  /**
   * logo 列表，可混用图片型与节点型。无限滚动通过复制整个序列实现。
   */
  logos: LogoItem[];
  /**
   * 滚动速度（px/s），默认 120。负值反转方向。
   */
  speed?: number;
  /**
   * 滚动方向，默认 "left"。"up"/"down" 为纵向滚动。
   */
  direction?: "left" | "right" | "up" | "down";
  /**
   * 容器宽度，数字按 px 处理，字符串原样使用，默认 "100%"。
   */
  width?: number | string;
  /**
   * 单个 logo 高度（px），默认 28。
   */
  logoHeight?: number;
  /**
   * logo 之间的间距（px），默认 32。
   */
  gap?: number;
  /**
   * 悬停是否暂停。true=停（速度归零），false=不停；
   * 与 hoverSpeed 配合时以 hoverSpeed 优先。默认 undefined（等价 true）。
   */
  pauseOnHover?: boolean;
  /**
   * 悬停时的目标速度（px/s）。设置后悬停切到该速度（可做减速而非全停）。
   */
  hoverSpeed?: number;
  /**
   * 是否在两端添加渐隐遮罩（吃 bg-surface token，自动明暗适配），默认 false。
   */
  fadeOut?: boolean;
  /**
   * 渐隐遮罩颜色，缺省取 var(--color-surface)。传任意 CSS 颜色可覆盖。
   */
  fadeOutColor?: string;
  /**
   * 悬停是否放大单个 logo（scale 1.2），默认 false。
   */
  scaleOnHover?: boolean;
  /**
   * 自定义渲染单项，覆盖默认图片/节点渲染逻辑。
   */
  renderItem?: (item: LogoItem, index: number) => ReactNode;
  /**
   * 根容器的无障碍标签，默认 "合作伙伴 logo"。
   */
  ariaLabel?: string;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
