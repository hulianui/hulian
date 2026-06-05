import type { ReactNode } from "react";

export interface GalaxyProps {
  /**
   * 星空聚焦点（归一化 0–1 坐标 [x, y]），决定星河发散的中心。
   * 默认 [0.5, 0.5]（容器正中）。
   */
  focal?: [number, number];

  /**
   * 整体取景旋转（cos/sin 形式的二维向量 [x, y]），默认 [1, 0]（不旋转）。
   * 例：[0.707, 0.707] ≈ 45° 倾斜星河。
   */
  rotation?: [number, number];

  /**
   * 星点漂移速度因子，默认 0.5。
   * 越大星河层间运动越快。
   */
  starSpeed?: number;

  /**
   * 星点密度，默认 1。
   * 越大同屏星点越密集，0.5 稀疏、2 繁星。
   */
  density?: number;

  /**
   * 色相偏移（角度，0–360），默认 140（偏青蓝星河）。
   * 改变整片星河的主色调，吃 token 思路下用它在主题色域里调色。
   */
  hueShift?: number;

  /**
   * 总动画速度倍率，默认 1。
   * 同时影响漂移与闪烁的快慢。
   */
  speed?: number;

  /**
   * 是否启用鼠标交互（移动时星河随之偏移 / 斥力），默认 true。
   */
  mouseInteraction?: boolean;

  /**
   * 星点辉光强度，默认 0.3。
   * 越大星点光晕越亮越大。
   */
  glowIntensity?: number;

  /**
   * 颜色饱和度，默认 0（接近白星）。
   * 调高让星点呈现彩色（配合 hueShift）。
   */
  saturation?: number;

  /**
   * 鼠标斥力模式：true = 星点被光标推开，false = 星河整体随光标平移，默认 true。
   * 仅在 mouseInteraction=true 时生效。
   */
  mouseRepulsion?: boolean;

  /**
   * 鼠标斥力强度，默认 2。仅 mouseRepulsion=true 时生效。
   */
  repulsionStrength?: number;

  /**
   * 星点闪烁强度，默认 0.3。0 = 不闪烁，1 = 强烈明灭。
   */
  twinkleIntensity?: number;

  /**
   * 星河自动旋转速度，默认 0.1。0 = 不自转。
   */
  rotationSpeed?: number;

  /**
   * 中心自动斥力，默认 0（关闭）。
   * 大于 0 时星点从中心向外排斥，形成空洞中心的"星环"观感。
   */
  autoCenterRepulsion?: number;

  /**
   * 背景是否透明，默认 true。
   * true 时 alpha 随星点亮度过渡（可叠在任意底色上）；
   * false 时填充纯黑底（经典深空）。
   */
  transparent?: boolean;

  /**
   * 额外 className，透传到根容器（或 reduced-motion fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的径向渐变深空 div（点缀微光）。
   */
  fallback?: ReactNode;
}
