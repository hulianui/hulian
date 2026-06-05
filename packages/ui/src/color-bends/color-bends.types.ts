import type { ReactNode } from "react";

export interface ColorBendsProps {
  /**
   * 色带颜色数组，最多取前 8 个。
   * 可传任意 CSS 颜色字符串（hex / rgb / oklch / var(--…) 均可，浏览器负责解析）。
   * 不传时默认读取瑚琏 chart token（--color-chart-1..5），自动吃明暗主题。
   */
  colors?: string[];
  /**
   * 静态基准旋转角度（度），默认 90。
   * 决定色带流场的整体朝向。
   */
  rotation?: number;
  /**
   * 自动旋转角速度（度/秒），默认 0（不自旋）。
   * 非 0 时流场随时间持续转动，与 rotation 叠加。
   */
  autoRotate?: number;
  /**
   * 流动速度系数，默认 0.2。越大色带演化越快；0 = 冻结为静态纹理。
   */
  speed?: number;
  /**
   * 流场缩放，默认 1。越小色带越密、纹理越细碎；越大越舒展。
   */
  scale?: number;
  /**
   * 波纹频率，默认 1。提升后正弦扰动更密集，色带更具颗粒层次。
   */
  frequency?: number;
  /**
   * 扭曲强度，默认 1。控制色带被波场拉扯变形的幅度；>1 时进一步放大位移。
   */
  warpStrength?: number;
  /**
   * 折叠迭代次数（1–5），默认 1。越大流场反复折叠，结构越复杂。
   */
  iterations?: number;
  /**
   * 整体亮度增益，默认 1.5。放大最终颜色，使色带更明亮饱满。
   */
  intensity?: number;
  /**
   * 色带宽度软参，默认 6。越大色带越窄越锐利，越小越宽越柔。
   */
  bandWidth?: number;
  /**
   * 颗粒噪声强度，默认 0.15。叠加细微颗粒打破色带的塑料感；0 = 纯净。
   */
  noise?: number;
  /**
   * 指针视差影响，默认 0.5。指针移动时流场轻微偏移，营造景深感。
   */
  parallax?: number;
  /**
   * 指针牵引强度，默认 1。指针靠近时局部流场被吸附扰动；0 = 不响应指针。
   */
  mouseInfluence?: number;
  /**
   * 是否透明背景（仅渲染色带、底色镂空），默认 true。
   * false 时填满黑底，色带叠加其上。
   */
  transparent?: boolean;
  /**
   * 透传到根容器的额外 className（组件自带 absolute inset-0 z-0）。
   */
  className?: string;
  /**
   * reduced-motion / 无 WebGL 降级时，渲染在静态渐变兜底层内的内容。
   */
  fallback?: ReactNode;
}
