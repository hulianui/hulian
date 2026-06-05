import type { ReactNode } from "react";

export interface BeamsProps {
  /**
   * 光束数量（纵向条带数），默认 12。
   * 越多越密集，建议 4–24；过大在低性能设备上会糊成一片。
   */
  beamNumber?: number;
  /**
   * 单束光的相对宽度，默认 2。
   * 数值越大每束越宽、束间缝隙越窄；与 beamNumber 共同决定铺满程度。
   */
  beamWidth?: number;
  /**
   * 光束沿轴流动的速度，默认 2。
   * 0 = 静止（仍保留静态光束纹理）；越大噪声扰动越快。
   */
  speed?: number;
  /**
   * 光束颜色，默认取瑚琏 `--color-chart-1` token（自动吃明暗主题）。
   * 可传任意 CSS 颜色字符串（hex / oklch / rgb / var(--color-…) 均可）。
   */
  lightColor?: string;
  /**
   * 颗粒噪声强度，默认 1.75。
   * 给光束叠加细微暗噪点，模拟胶片质感；0 = 纯净无颗粒。
   */
  noiseIntensity?: number;
  /**
   * 噪声纹理缩放，默认 0.2。
   * 越小波纹越舒展（大尺度起伏），越大越细碎。
   */
  scale?: number;
  /**
   * 整组光束的旋转角度（度），默认 30。
   * 0 = 垂直；正值顺时针倾斜，营造斜射光幕。
   */
  rotation?: number;
  /**
   * 透传到根容器的额外 className（根自带 `absolute inset-0 z-0`）。
   */
  className?: string;
  /**
   * reduced-motion / 无 WebGL 时降级渲染的静态内容（叠在渐变兜底之上）。
   */
  fallback?: ReactNode;
}
