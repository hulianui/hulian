import type { ReactNode } from "react";

export interface OrbProps {
  /**
   * 色相旋转（度）。0 = 原始蓝紫色系；正值顺时针旋转 YIQ 色相。
   * @default 0
   */
  hue?: number;
  /**
   * 悬停时扭曲强度（0–1）。越大，鼠标悬停时光球变形越明显。
   * @default 0.2
   */
  hoverIntensity?: number;
  /**
   * 悬停时是否自动旋转光球。
   * @default true
   */
  rotateOnHover?: boolean;
  /**
   * 强制保持悬停激活态（适合演示 / 截图场景）。
   * @default false
   */
  forceHoverState?: boolean;
  /**
   * 透传到 canvas（正常渲染）或 fallback div（reduced-motion / 无 WebGL）的 className。
   */
  className?: string;
  /**
   * reduced-motion 或无 WebGL 时的自定义静态备用内容（放在径向渐变球中央）。
   */
  fallback?: ReactNode;
}
