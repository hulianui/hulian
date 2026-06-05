import type { CSSProperties, ReactNode } from "react";

export interface ImageTrailProps {
  /**
   * 跟随光标拖尾依次出现的图片 URL 列表（循环复用）。
   * 至少传 1 张；建议 6–12 张以获得连贯的拖尾观感。
   */
  images: string[];
  /**
   * 光标累计位移触发下一张图的阈值（px），默认 80。
   * 越小拖尾越密集、出图越频繁；越大越稀疏。
   */
  threshold?: number;
  /**
   * 单张图片的宽度（px），默认 190。高度按 1.1 宽高比自动派生。
   */
  imageWidth?: number;
  /**
   * 跟随插值系数（0–1），默认 0.5。越大跟手越紧，越小越「黏滞」拖尾。
   */
  followStrength?: number;
  /**
   * 单张图从出现到淡出消失的时长（秒），默认 0.8。
   */
  fadeDuration?: number;
  /**
   * 透传到根容器的额外 className（根为 relative + overflow-hidden 的捕获层）。
   */
  className?: string;
  /**
   * 覆盖在拖尾层之上的内容（如标题文案），层叠于图片之上。
   */
  children?: ReactNode;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
