import type { CSSProperties } from "react";

export interface DotFieldProps {
  /**
   * 点阵半径（px），单个点的绘制大小，默认 1.5。
   * 越大点越粗；建议 1–3。
   */
  dotRadius?: number;
  /**
   * 相邻点之间的间距（px），默认 14。
   * 越大点阵越稀疏；建议 8–24。
   */
  dotSpacing?: number;
  /**
   * 光标影响半径（px），鼠标周围多大范围内的点会被推挤，默认 220。
   * 越大涟漪范围越广。
   */
  cursorRadius?: number;
  /**
   * 鼓胀强度（px），点被光标推离原位的最大位移，默认 56。
   * 越大隆起越夸张；设 0 则点阵静止仅随光标发光。
   */
  bulgeStrength?: number;
  /**
   * 点阵基色，默认取瑚琏 `--color-chart-1` token（自动吃明暗主题）。
   * 可传任意 CSS 颜色字符串（hex / oklch / rgb / var(--…)）。
   * 注意：喂给 canvas 的 token 必须带 `--color-` 前缀方能解析。
   */
  color?: string;
  /**
   * 光标处的辉光颜色，默认取 `--color-primary` token。
   * 鼠标快速移动时在点阵下方渲染一团径向辉光。
   */
  glowColor?: string;
  /**
   * 辉光半径（px），默认 160。设 0 关闭辉光。
   */
  glowRadius?: number;
  /**
   * 波浪振幅（px），全局正弦起伏，默认 0（无波浪）。
   * 大于 0 时点阵整体做缓慢的有机波动，营造「呼吸」感。
   */
  waveAmplitude?: number;
  /**
   * 是否开启随机闪烁（少量点偶尔放大成「星点」），默认 false。
   */
  sparkle?: boolean;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
