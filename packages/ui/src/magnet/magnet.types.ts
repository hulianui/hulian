import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export interface MagnetProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /**
   * 被磁吸的内容（按钮、图标、卡片等任意节点）。
   */
  children?: ReactNode;
  /**
   * 触发磁吸的感应半径（px），自元素边界向外扩展。
   * 指针进入「元素 + padding」范围内即开始吸附，默认 100。
   * 越大越「远距离感应」，越小越需要贴近。
   */
  padding?: number;
  /**
   * 禁用磁吸：指针不再牵引，内容平滑归位至原点，默认 false。
   * 关闭/开启时 DOM 结构不变，只是停止位移。
   */
  disabled?: boolean;
  /**
   * 磁吸强度的「除数」，越小吸力越强（位移越大），默认 2。
   * 实际位移 = 指针到中心的距离 / magnetStrength。
   * 建议范围 1–6；为 1 时内容几乎贴住指针。
   */
  magnetStrength?: number;
  /**
   * 吸附激活态的过渡（指针在感应区内、跟随指针时），默认较快的 ease-out。
   * 默认："transform 0.3s ease-out"。
   */
  activeTransition?: string;
  /**
   * 失活态的过渡（指针离开、归位时），默认较慢的 ease-in-out 回弹感。
   * 默认："transform 0.5s ease-in-out"。
   */
  inactiveTransition?: string;
  /**
   * 透传到外层包裹 div 的额外 className（定位/尺寸）。
   */
  wrapperClassName?: string;
  /**
   * 透传到内层位移 div 的额外 className（实际承载 transform 的层）。
   */
  innerClassName?: string;
  /**
   * 透传到外层包裹 div 的内联样式。
   */
  style?: CSSProperties;
}
