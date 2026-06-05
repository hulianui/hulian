import type { CSSProperties, ReactNode } from "react";

export interface FaultyTerminalProps {
  /**
   * 整体 UV 缩放，越大字符网格越密、视野越远，默认 1.5。
   * 直接映射到 GLSL uniform uScale。
   */
  scale?: number;

  /**
   * 字符网格行列倍率 [x, y]，默认 [2, 1]（横向更密，仿宽屏终端）。
   * 直接映射到 GLSL uniform uGridMul。
   */
  gridMul?: [number, number];

  /**
   * 单个字符内点阵大小，默认 1.5。越大每个"数字"块越胖。
   */
  digitSize?: number;

  /**
   * 时间流速因子，越大故障/闪烁越快，默认 0.3。
   */
  timeScale?: number;

  /**
   * 是否冻结动画（暂停时间推进，画面定格），默认 false。
   * 注意：reduced-motion 下会强制冻结，与本 prop 取或。
   */
  pause?: boolean;

  /**
   * 扫描线（横向滚动亮带）强度，默认 0.3。0 = 无扫描线。
   */
  scanlineIntensity?: number;

  /**
   * 横向撕裂故障量，默认 1（基准）。>1 撕裂更夸张，1 = 原始位移。
   */
  glitchAmount?: number;

  /**
   * 整屏忽明忽暗的闪烁量，默认 1。0 = 无闪烁。
   */
  flickerAmount?: number;

  /**
   * 背景有机噪声振幅，默认 0（关闭，纯字符雨）。增大会叠加流动雾噪。
   */
  noiseAmp?: number;

  /**
   * 色散（RGB 分离）像素量，默认 0。模拟老 CRT 的色边，建议 0–6。
   */
  chromaticAberration?: number;

  /**
   * 抖动颗粒强度（可传 number 或 boolean），默认 0。
   * boolean 时 true=1 / false=0，叠加细微噪点抗色阶断层。
   */
  dither?: number | boolean;

  /**
   * 桶形畸变（CRT 球面弯曲）量，默认 0.2。0 = 平面，越大边缘越鼓。
   */
  curvature?: number;

  /**
   * 字符着色，CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 `--color-chart-2` 取主题色，实现明暗自适应（替原版写死 #ffffff）。
   */
  tint?: string;

  /**
   * 是否响应鼠标（鼠标处字符发亮 + 涟漪），默认 true。
   */
  mouseReact?: boolean;

  /**
   * 鼠标影响强度，默认 0.2。仅 mouseReact=true 时生效。
   */
  mouseStrength?: number;

  /**
   * 是否启用加载时逐格淡入动画，默认 true。
   */
  pageLoadAnimation?: boolean;

  /**
   * 整体亮度倍率，默认 1。提亮/压暗字符雨。
   */
  brightness?: number;

  /**
   * 额外 className，透传到根容器（或 reduced/无 WebGL 兜底层）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容（叠在兜底底色之上）。
   */
  fallback?: ReactNode;

  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
