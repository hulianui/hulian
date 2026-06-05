import type { ReactNode } from "react";

export interface SilkProps {
  /**
   * 动画速度因子，越大越快，默认 5。
   * 直接映射到 GLSL uniform uSpeed。
   */
  speed?: number;

  /**
   * 噪声/纹理缩放，默认 1。
   * 值越大细节越密，值越小越宏观。
   */
  scale?: number;

  /**
   * 丝绸主色，CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 CSS 变量 `--color-chart-1` 取主题色，实现明暗自适应。
   */
  color?: string;

  /**
   * 颗粒噪声强度，默认 1.5。
   * 越大颗粒感越强，0 = 无颗粒（纯色带）。
   */
  noiseIntensity?: number;

  /**
   * 纹理旋转角度（弧度），默认 0。
   * 例：Math.PI / 4 = 45°斜向丝绸。
   */
  rotation?: number;

  /**
   * 额外 className，透传到 canvas（或 fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的 linear-gradient 装饰 div。
   */
  fallback?: ReactNode;
}
