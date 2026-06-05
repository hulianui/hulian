import type { ReactNode } from "react";

export interface EvilEyeProps {
  /**
   * 眼睛主火焰色。默认读 `--color-chart-3` token（暖橙调，明暗自适应）。
   * 可传任意 CSS 颜色字符串（hex / oklch / rgb / `var(--…)` 均可）。
   * 不传时优先吃主题 token，使邪眼随明暗主题换色。
   */
  eyeColor?: string;
  /**
   * 背景底色。默认透明（读不到时回退黑），容器自身的深色底负责衬托。
   * 一般保持默认即可；若需在浅底上使用可显式传深色。
   */
  backgroundColor?: string;
  /**
   * 整体发光强度倍率，默认 1.5。越大火焰越亮、对比越强。
   * 建议范围 0.8–2.5。
   */
  intensity?: number;
  /**
   * 瞳孔大小，默认 0.6。值越大瞳孔越饱满（细长椭圆），越小越收缩成缝。
   * 建议范围 0.2–1.0。
   */
  pupilSize?: number;
  /**
   * 虹膜（内环火焰）宽度，默认 0.25。越大火焰内环越厚。
   * 建议范围 0.1–0.4。
   */
  irisWidth?: number;
  /**
   * 外圈辉光强度，默认 0.35。控制眼睛外缘弥散光晕的浓度。
   * 建议范围 0.1–0.6。
   */
  glowIntensity?: number;
  /**
   * 眼睛缩放，默认 0.8。值越大眼睛在画面里越大（占满更多区域）。
   * 建议范围 0.5–1.2。
   */
  scale?: number;
  /**
   * 火焰噪声纹理缩放，默认 1.0。越大火焰纹路越细碎，越小越粗犷。
   * 建议范围 0.5–2.0。
   */
  noiseScale?: number;
  /**
   * 瞳孔跟随光标的幅度，默认 1.0。0 = 瞳孔不动；>0 时瞳孔随鼠标在眼内偏移。
   * 跟随做了惯性 lerp，松手会缓缓回正。
   */
  pupilFollow?: number;
  /**
   * 火焰流动速度，默认 1.0。越大火焰翻腾越快。
   * 建议范围 0.3–2.0。
   */
  flameSpeed?: number;
  /**
   * 透传到根容器 div 的额外 className（控制尺寸、定位、透明度等）。
   * 组件默认 `block h-full w-full`，尺寸由容器决定。
   */
  className?: string;
  /**
   * reduced-motion / 无 WebGL 降级时，叠加在静态邪眼兜底层里的内容。
   */
  fallback?: ReactNode;
}
