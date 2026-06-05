import type { ReactNode } from "react";

/** 铁磁流体的流向。控制色带峰脊整体漂移的方向。 */
export type FerrofluidFlowDirection = "up" | "down" | "left" | "right";

export interface FerrofluidProps {
  /**
   * 流体色带，CSS 颜色字符串数组（hex / oklch / rgb / var(--…) 均可），最多 8 色。
   * 按高度梯度从低到高映射，制造金属液面的色彩分层。
   * 默认从瑚琏 chart token（--color-chart-1/2/4）取，明暗主题自适应。
   */
  colors?: string[];

  /**
   * 动画速度因子，越大流动越快，默认 0.5。
   * 映射到 shader 的 uSpeed（内部再乘 200 的基速）。
   */
  speed?: number;

  /**
   * 噪声/纹理缩放，默认 1.6。
   * 值越大液面越细密，越小越宏观；过小（< 0.05）会被钳到下限。
   */
  scale?: number;

  /**
   * 湍流强度，默认 1。
   * 控制峰脊扭曲的剧烈程度，0 = 近乎静止的平滑液面。
   */
  turbulence?: number;

  /**
   * 流动性（峰脊融合柔度），默认 0.1。
   * 越大相邻峰脊融合越软（更像液体），越小越锐利分明。下限 0.001。
   */
  fluidity?: number;

  /**
   * 高光边缘的宽度，默认 0.2。
   * 控制液面峰脊处亮带的粗细。
   */
  rimWidth?: number;

  /**
   * 高光锐度（gamma 指数），默认 2.5。
   * 越大亮带越收束、对比越硬；越小越弥散柔和。
   */
  sharpness?: number;

  /**
   * 微光扰动强度，默认 1.5。
   * 在亮带上叠加细碎噪声，制造金属流体的闪烁质感。
   */
  shimmer?: number;

  /**
   * 整体辉光增益，默认 2。
   * 线性放大亮带亮度；越大越发光。
   */
  glow?: number;

  /**
   * 流向，默认 "down"。可选 up / down / left / right。
   * @see FerrofluidFlowDirection
   */
  flowDirection?: FerrofluidFlowDirection;

  /**
   * 整体不透明度，默认 1。范围 0–1，乘在最终 alpha 上。
   */
  opacity?: number;

  /**
   * 是否开启鼠标交互（指针处液面下凹/抑制亮带），默认 true。
   * jsdom / 无 WebGL 环境下自动无效，不影响渲染。
   */
  mouseInteraction?: boolean;

  /**
   * 鼠标影响强度，默认 1。仅在 mouseInteraction=true 时生效。
   */
  mouseStrength?: number;

  /**
   * 鼠标影响半径（归一化），默认 0.35。越大波及范围越广。
   */
  mouseRadius?: number;

  /**
   * 鼠标跟随阻尼（秒，指数平滑时间常数），默认 0.15。
   * 0 = 立即跟随；越大越粘滞拖尾。
   */
  mouseDampening?: number;

  /**
   * 设备像素比上限，默认取 min(window.devicePixelRatio, 2)。
   * 调低可在高分屏上省 GPU。
   */
  dpr?: number;

  /**
   * 额外 className，透传到根容器（或 reduced fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的径向渐变装饰 div（保留液态金属的层次感）。
   */
  fallback?: ReactNode;
}
