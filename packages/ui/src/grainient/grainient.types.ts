import type { ReactNode } from "react";

export interface GrainientProps {
  /**
   * 时间流速倍率（控制纹理整体演化速度），默认 0.25。
   * 0 = 静止；越大色场翻涌越快。
   */
  timeSpeed?: number;
  /**
   * 三色渐变的偏置（沿混合轴平移色带分布），默认 0。
   * 负值偏向 color3 一侧，正值偏向 color1 一侧。
   */
  colorBalance?: number;
  /**
   * 域扭曲强度（值越大扭曲越克制——内部按 amplitude/strength 反比），默认 1。
   * 建议 0.3–3。
   */
  warpStrength?: number;
  /**
   * 域扭曲正弦频率（色带褶皱的密度），默认 5。
   */
  warpFrequency?: number;
  /**
   * 域扭曲随时间漂移的速度，默认 2。
   */
  warpSpeed?: number;
  /**
   * 域扭曲基础振幅，默认 50。与 warpStrength 共同决定褶皱幅度。
   */
  warpAmplitude?: number;
  /**
   * 三色混合的轴向角度（度），默认 0。旋转色带的过渡方向。
   */
  blendAngle?: number;
  /**
   * 色带过渡的柔和度（smoothstep 边缘宽度），默认 0.05。越大越柔。
   */
  blendSoftness?: number;
  /**
   * 噪声驱动的整体旋转量（度），默认 500。制造有机的方向扰动。
   */
  rotationAmount?: number;
  /**
   * 旋转噪声的采样缩放，默认 2。越大扰动越细碎。
   */
  noiseScale?: number;
  /**
   * 颗粒（grain）叠加强度，默认 0.1。0 = 纯净渐变；越大胶片颗粒感越重。
   */
  grainAmount?: number;
  /**
   * 颗粒采样缩放（颗粒密度），默认 2。
   */
  grainScale?: number;
  /**
   * 颗粒是否随时间闪动，默认 false（静态颗粒，性能更友好）。
   */
  grainAnimated?: boolean;
  /**
   * 对比度，默认 1.5。围绕中灰拉伸明暗。
   */
  contrast?: number;
  /**
   * Gamma 校正，默认 1。<1 提亮、>1 压暗。
   */
  gamma?: number;
  /**
   * 饱和度，默认 1。0 = 灰阶；>1 增艳。
   */
  saturation?: number;
  /**
   * 视图中心横向偏移，默认 0。配合 zoom 取景。
   */
  centerX?: number;
  /**
   * 视图中心纵向偏移，默认 0。
   */
  centerY?: number;
  /**
   * 缩放（取景远近），默认 0.9。越小看到的色场范围越大。
   */
  zoom?: number;
  /**
   * 渐变第一色（亮端），任意 CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 不传则吃瑚琏 `--color-chart-1` token（明暗自适应）。
   */
  color1?: string;
  /**
   * 渐变第二色（主色/中段），不传则吃 `--color-chart-2` token。
   */
  color2?: string;
  /**
   * 渐变第三色（暗端），不传则吃 `--color-chart-4` token。
   */
  color3?: string;
  /**
   * 透传到根容器的额外 className。组件自带 `absolute inset-0 z-0`，
   * 放在 `relative` 容器里即铺满。
   */
  className?: string;
  /**
   * reduced-motion / 无 WebGL 降级时，渲染在静态渐变兜底层里的内容。
   */
  fallback?: ReactNode;
}
