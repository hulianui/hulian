import type { CSSProperties, ReactNode } from "react";

/** 高光扫光方向（条纹明暗倾向的左右翻转）。 */
export type GradientBlindsShineDirection = "left" | "right";

export interface GradientBlindsProps {
  /**
   * 渐变色站（gradient stops），按顺序在水平方向上插值成色带，最多取前 8 个。
   * 可传任意 CSS 颜色字符串（hex / oklch / rgb / `var(--color-…)` 均可），
   * 由浏览器统一解析为 RGB 喂给 shader。
   * 默认取瑚琏 chart token：`["var(--color-chart-1)", "var(--color-chart-3)"]`（明暗自适应）。
   */
  gradientColors?: string[];

  /**
   * 整条色带的旋转角度（度），默认 0。
   * 例：90 = 渐变竖向，45 = 斜向。仅旋转渐变与百叶纹理，不旋转容器。
   */
  angle?: number;

  /**
   * 颗粒噪声强度，默认 0.3。
   * 越大颗粒感越强，0 = 无颗粒（纯净色带）。建议范围 0–1。
   */
  noise?: number;

  /**
   * 百叶（竖条）数量，默认 16。
   * 与 `blindMinWidth` 取较小者作为实际条数，保证窄容器里不至于过密。
   */
  blindCount?: number;

  /**
   * 单条百叶的最小宽度（px），默认 60。
   * 容器较窄时按此宽度上限收敛条数（`floor(宽度 / blindMinWidth)`）。
   * 传 0 / 负值则关闭该约束，完全使用 `blindCount`。
   */
  blindMinWidth?: number;

  /**
   * 鼠标跟随阻尼时间常数（秒），默认 0.15。
   * 越大聚光灯跟手越"懒"（拖尾更久），0 = 瞬时跟随无阻尼。
   */
  mouseDampening?: number;

  /**
   * 是否镜像渐变（色带在中点对折，形成对称往返），默认 false。
   */
  mirrorGradient?: boolean;

  /**
   * 聚光灯半径（归一化，相对容器对角线尺度），默认 0.5。
   * 越大光斑越大；最小被钳到 1e-4 避免除零。
   */
  spotlightRadius?: number;

  /**
   * 聚光灯软硬度（衰减指数），默认 1。
   * 越大边缘越锐利收束，越小越柔和弥散。
   */
  spotlightSoftness?: number;

  /**
   * 聚光灯强度，默认 1。
   * 越大光斑越亮；0 = 无聚光灯效果。
   */
  spotlightOpacity?: number;

  /**
   * 渐变扭曲幅度，默认 0（不扭曲）。
   * 越大色带越呈波浪起伏（叠加正弦/余弦位移）。
   */
  distortAmount?: number;

  /**
   * 高光扫光方向，默认 "left"。
   * "right" 时翻转每条百叶内部的明暗倾向。
   */
  shineDirection?: GradientBlindsShineDirection;

  /**
   * 设备像素比上限，默认自动取 `min(devicePixelRatio, 2)`。
   * 显式传入可在高分屏上权衡清晰度与性能。
   */
  dpr?: number;

  /**
   * 额外 className，透传到根容器 div（也可用于调整透明度 / mix-blend-mode）。
   */
  className?: string;

  /**
   * 根容器内联样式（透传）。例如设置 `mixBlendMode`。
   */
  style?: CSSProperties;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的 repeating-linear-gradient 百叶静态兜底装饰层。
   */
  fallback?: ReactNode;
}
