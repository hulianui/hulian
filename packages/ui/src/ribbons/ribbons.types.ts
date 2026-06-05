import type { ReactNode } from "react";

export interface RibbonsProps {
  /**
   * 飘带颜色数组，每个 CSS 颜色字符串生成一条独立飘带。
   * 支持 hex / oklch / rgb / `var(--color-…)`。
   * 默认从 chart token（`--color-chart-1/2/3`）取三条主题色，明暗自适应。
   */
  colors?: string[];

  /**
   * 弹簧刚度基准，越大飘带追随鼠标越紧，默认 0.03。
   * 每条飘带在此基础上叠加一点随机量，制造错落的群体感。
   */
  baseSpring?: number;

  /**
   * 阻尼摩擦基准（0–1），越大越"黏滞"、过冲越少，默认 0.9。
   */
  baseFriction?: number;

  /**
   * 飘带基础粗细（像素），默认 30。
   */
  baseThickness?: number;

  /**
   * 多条飘带之间的横向偏移因子，默认 0.05。
   * 越大飘带散得越开（每条围绕鼠标的目标点错开）。
   */
  offsetFactor?: number;

  /**
   * 拖尾衰减寿命（毫秒），默认 500。越大尾巴越长、跟随越慵懒。
   * 传 0 或 Infinity 则退回固定 0.9 lerp 衰减。
   */
  maxAge?: number;

  /**
   * 每条飘带的采样点数（决定折线平滑度），默认 50。
   */
  pointCount?: number;

  /**
   * 拖尾追赶速度倍率，默认 0.6。配合 maxAge 控制尾巴的"软硬"。
   */
  speedMultiplier?: number;

  /**
   * 是否沿飘带长度方向渐隐（尾部透明），默认 false。
   */
  enableFade?: boolean;

  /**
   * 是否启用 shader 波动特效（飘带沿法线方向正弦抖动），默认 false。
   */
  enableShaderEffect?: boolean;

  /**
   * shader 波动振幅，仅在 enableShaderEffect=true 时生效，默认 2。
   */
  effectAmplitude?: number;

  /**
   * 额外 className，透传到容器（或 reduced-motion fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的静态渐变装饰 div。
   */
  fallback?: ReactNode;
}
