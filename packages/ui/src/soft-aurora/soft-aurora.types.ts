import type { CSSProperties, ReactNode } from "react";

export interface SoftAuroraProps {
  /**
   * 主极光色带颜色（第 1 层）。
   * 接受任意 CSS 颜色字符串（hex / rgb / oklch / `var(--color-chart-1)` 均可），
   * 运行时通过离屏 canvas 解析为 shader 所需的 RGB 向量，故可直接吃瑚琏 chart token。
   * 默认：`var(--color-chart-1)`。
   */
  color1?: string;
  /**
   * 辅助极光色带颜色（第 2 层），与第 1 层错位叠加产生混色干涉。
   * 同样接受任意 CSS 颜色字符串。
   * 默认：`var(--color-chart-4)`。
   */
  color2?: string;
  /**
   * 极光流动速度倍率，默认 0.6。越大越活跃；建议范围 0.2–2。
   */
  speed?: number;
  /**
   * 噪声采样缩放，默认 1.5。越大极光纹理越细碎；建议范围 0.8–3。
   */
  scale?: number;
  /**
   * 整体亮度倍率，默认 1。可压暗（<1）或提亮（>1）极光。
   */
  brightness?: number;
  /**
   * 噪声基频，默认 2.5。影响极光褶皱密度。
   */
  noiseFrequency?: number;
  /**
   * 噪声基振幅，默认 1。影响极光起伏幅度。
   */
  noiseAmplitude?: number;
  /**
   * 极光带垂直位置（0–1），默认 0.5（垂直居中）。越小越靠下，越大越靠上。
   */
  bandHeight?: number;
  /**
   * 极光带辉光扩散强度，默认 1。越大辉光越浓越亮。
   */
  bandSpread?: number;
  /**
   * 多倍频噪声衰减系数，默认 0.1。控制高频细节的占比。
   */
  octaveDecay?: number;
  /**
   * 两层极光的时间相位偏移，默认 0。非 0 时两层错峰流动，层次更丰富。
   */
  layerOffset?: number;
  /**
   * 色相循环流动速度，默认 1。控制 cosine 渐变沿水平方向的滚动快慢。
   */
  colorSpeed?: number;
  /**
   * 是否开启鼠标视差交互（极光随指针轻微平移），默认 true。
   * reduced-motion 或无 WebGL 时自动失效（降级为静态渐变）。
   */
  enableMouseInteraction?: boolean;
  /**
   * 鼠标视差强度，默认 0.25。越大极光跟随指针的位移越明显。
   */
  mouseInfluence?: number;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * reduced-motion / 无 WebGL 时降级渲染的静态层之上覆盖的内容（如标题）。
   */
  fallback?: ReactNode;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
