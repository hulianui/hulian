import type { CSSProperties, ReactNode } from "react";

export interface DecayCardProps {
  /**
   * 卡片宽度（px），默认 300。
   */
  width?: number;
  /**
   * 卡片高度（px），默认 400。
   */
  height?: number;
  /**
   * 卡片主图地址。鼠标快速划过时该图会被湍流位移「融化 / 溶解」。
   * 默认取一张灰度占位图；生产环境请替换为业务图片。
   */
  image?: string;
  /**
   * 图片 alt 文本（无障碍）。默认空字符串（纯装饰图）。
   */
  alt?: string;
  /**
   * feTurbulence 的基础频率，越大噪声越密、溶解颗粒越细，默认 0.015。
   * 建议范围 0.005–0.05。
   */
  baseFrequency?: number;
  /**
   * feTurbulence 的倍频层数，越多湍流细节越丰富（也越耗），默认 5。
   */
  numOctaves?: number;
  /**
   * 湍流随机种子，换数字即换一套溶解纹理，默认 4。
   */
  seed?: number;
  /**
   * 位移上限：鼠标移动越快，feDisplacementMap 的 scale 越大、溶解越剧烈。
   * 该值是 scale 的峰值，默认 400。
   */
  maxDisplacement?: number;
  /**
   * 卡片随鼠标平移的软边界（px）。超过该距离后位移按 0.2 系数继续推进，
   * 形成「拉到头有阻尼」的弹性手感，默认 50。
   */
  movementBound?: number;
  /**
   * 覆盖在卡片底部的文字内容（标题等），层叠在图片之上、不受溶解影响。
   */
  children?: ReactNode;
  /**
   * 透传到根容器的额外 className（与内置类名 cn 合并）。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
