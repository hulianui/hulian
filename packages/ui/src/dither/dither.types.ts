import type { ReactNode } from "react";

export interface DitherProps {
  /**
   * 波纹流动速度，越大越快，默认 0.05。
   * 直接映射到 GLSL uniform waveSpeed（域偏移 = time * waveSpeed）。
   * reduced-motion 下时间冻结，波形保留静态画面。
   */
  waveSpeed?: number;

  /**
   * 波纹频率（fbm 倍频步长），默认 3。
   * 越大噪声层级越密，纹理越细碎；越小越宏观平滑。
   */
  waveFrequency?: number;

  /**
   * 波纹振幅衰减因子（每个 octave 的衰减），默认 0.3。
   * 越大高频细节越强，越小越柔和。
   */
  waveAmplitude?: number;

  /**
   * 波纹主色，CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 CSS 变量 `--color-chart-1` 取主题色，实现明暗自适应。
   */
  waveColor?: string;

  /**
   * 量化色阶数，默认 4。
   * 复古抖动的核心：颜色被压成 colorNum 级，配合 8×8 Bayer 矩阵
   * 产生有序抖动（ordered dithering）的颗粒带状质感。越小越「8-bit」。
   */
  colorNum?: number;

  /**
   * 抖动像素块大小，默认 2。
   * 越大马赛克越粗（像素艺术感越强），越小越接近原始波纹。
   */
  pixelSize?: number;

  /**
   * 是否禁用动画（冻结波形为静帧），默认 false。
   * 与 reduced-motion 等效，但可显式控制。
   */
  disableAnimation?: boolean;

  /**
   * 额外 className，透传到 canvas（或 fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的棋盘格 + 渐变装饰 div（呼应抖动质感）。
   */
  fallback?: ReactNode;
}
