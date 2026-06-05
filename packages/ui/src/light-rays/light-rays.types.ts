import type { CSSProperties, ReactNode } from "react";

/** 光束发射原点，决定光束锚点与传播方向。 */
export type LightRaysOrigin =
  | "top-center"
  | "top-left"
  | "top-right"
  | "left"
  | "right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface LightRaysProps {
  /**
   * 光束发射原点，决定锚点位置与传播方向，默认 "top-center"（自顶部中央向下散射）。
   * 八向可选：四角 / 四边中点。
   */
  raysOrigin?: LightRaysOrigin;
  /**
   * 光束颜色。默认取瑚琏 `--color-chart-1` token（明暗主题自适应）。
   * 可传任意 CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可），由离屏 canvas 解析为 RGB。
   */
  raysColor?: string;
  /**
   * 光束闪烁/律动速度倍率，默认 1。越大越活跃；0 近乎静止（但仍渲染一帧）。
   */
  raysSpeed?: number;
  /**
   * 光束扩散角度，默认 1。越大光束越宽、越散；越小越聚拢成细束。建议 0.3–3。
   */
  lightSpread?: number;
  /**
   * 光束长度（相对视口宽的倍数），默认 2。越大光束拖得越远。
   */
  rayLength?: number;
  /**
   * 是否脉动（整体亮度随时间正弦呼吸），默认 false。
   */
  pulsating?: boolean;
  /**
   * 光束沿程渐隐距离（相对视口宽的倍数），默认 1。越小越快淡出。
   */
  fadeDistance?: number;
  /**
   * 饱和度，默认 1。<1 去色趋灰，0 = 纯灰阶。
   */
  saturation?: number;
  /**
   * 是否让光束方向跟随鼠标，默认 true。需配合 mouseInfluence>0 才有可见偏转。
   */
  followMouse?: boolean;
  /**
   * 鼠标对光束方向的影响权重（0–1），默认 0.1。0 完全不偏转。
   */
  mouseInfluence?: number;
  /**
   * 颗粒噪声强度（0–1），默认 0，给光束叠加细微噪点质感。
   */
  noiseAmount?: number;
  /**
   * 角度扭曲强度，默认 0，让光束随时间轻微摇曳而非笔直。建议 0–1。
   */
  distortion?: number;
  /**
   * 透传到根容器的额外 className。组件自带 `pointer-events-none absolute inset-0 z-0`。
   */
  className?: string;
  /**
   * reduced-motion / 无 WebGL 时渲染的静态兜底内容（叠在静态渐变之上）。
   */
  fallback?: ReactNode;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
  /**
   * 叠在光束层之上的内容（如标题/文案）。WebGL 与降级两条路径均渲染，保证 DOM 一致。
   */
  children?: ReactNode;
}
