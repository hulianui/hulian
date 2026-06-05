import type { HTMLAttributes } from "react";

/** 单个导航项 */
export interface PillNavItem {
  /** 链接地址（http/https/mailto/tel/# 外链或站内路由皆可，组件只渲染 <a>） */
  href: string;
  /** 显示文案 */
  label: string;
  /** 无障碍标签，缺省回退到 label */
  ariaLabel?: string;
}

export interface PillNavProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /**
   * 导航项列表。每项渲染为一颗胶囊，悬停时底部圆形涨满 + 文案翻转为反相色。
   */
  items: PillNavItem[];
  /**
   * 当前激活项的 href，命中后胶囊常驻反相态并在底部点亮一枚指示圆点。
   */
  activeHref?: string;
  /**
   * 可选品牌标识（渲染为左侧圆形 logo 区的内容，通常放 <img> 或图标）。
   * 悬停时整枚 logo 旋转一圈。不传则不渲染 logo 区。
   */
  logo?: React.ReactNode;
  /**
   * logo 区的链接地址，缺省取 items[0].href，再缺省为 "#"。
   */
  logoHref?: string;
  /**
   * logo 区无障碍标签。
   * @default "Home"
   */
  logoAriaLabel?: string;
  /**
   * 是否启用首次加载入场动画（logo 缩放弹入 + 导航胶囊整体展开）。
   * reduced-motion 下自动跳过。
   * @default true
   */
  initialLoadAnimation?: boolean;
  /** 合并到根 <nav> 的额外类名 */
  className?: string;
}
