import type { ReactNode } from "react";

export interface LineWavesProps {
  /**
   * 动画速度因子，越大波纹流动越快，默认 0.3。
   * 直接映射到 GLSL uniform uSpeed；0 = 静止纹理。
   */
  speed?: number;

  /**
   * 中心区域（未触发边缘渐隐处）的线条密度，默认 32。
   * 值越大线条越密集；与 outerLineCount 共同决定疏密渐变。
   */
  innerLineCount?: number;

  /**
   * 边缘区域的线条密度，默认 36。
   * 与 innerLineCount 不同时，上下边缘到中心会产生疏密过渡。
   */
  outerLineCount?: number;

  /**
   * 波纹扭曲强度，默认 1。
   * 越大线条被正弦位移得越剧烈（越"波涛汹涌"），0 = 笔直平行线。
   */
  warpIntensity?: number;

  /**
   * 整体纹理旋转角度（度），默认 -45。
   * 原版默认 -45° 使波纹呈对角线走向。
   */
  rotation?: number;

  /**
   * 上下边缘渐隐起始宽度，默认 0。
   * 配合内部 smoothstep 控制疏密带的过渡位置；增大可让中心线条区收窄。
   */
  edgeFadeWidth?: number;

  /**
   * 颜色循环速度，默认 1。
   * 让三通道色相随时间缓慢漂移；0 = 颜色恒定。
   */
  colorCycleSpeed?: number;

  /**
   * 整体亮度系数，默认 0.2。
   * 因 alpha = 颜色长度，亮度同时影响透明度——越大线条越亮越实。
   * 建议范围 0.1–0.6。
   */
  brightness?: number;

  /**
   * 第一通道颜色，CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 `--color-chart-1` token 取，明暗自适应。
   * 三色全留默认即得"瑚琏配色"波纹；三色都传同一值（如 #ffffff）可还原原版白线。
   */
  color1?: string;

  /**
   * 第二通道颜色，默认从 `--color-chart-2` token 取。
   */
  color2?: string;

  /**
   * 第三通道颜色，默认从 `--color-chart-4` token 取。
   */
  color3?: string;

  /**
   * 是否开启鼠标交互（指针处线条被局部扭曲外推），默认 true。
   * 关闭则纯自动流动，鼠标锚定中心（0.5, 0.5）。
   */
  enableMouseInteraction?: boolean;

  /**
   * 鼠标影响强度，默认 2。
   * 越大指针处波纹隆起越明显，仅在 enableMouseInteraction=true 时生效。
   */
  mouseInfluence?: number;

  /**
   * 额外 className，透传到根容器（或 reduced-motion fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的斜向 repeating-linear-gradient 线纹装饰。
   */
  fallback?: ReactNode;
}
