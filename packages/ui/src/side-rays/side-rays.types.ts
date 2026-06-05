import type { ReactNode } from "react";

/** 光束发散起点角落。 */
export type SideRaysOrigin =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export interface SideRaysProps {
  /**
   * 光束动画速度因子，越大波动越快，默认 2.5。
   * 直接映射到 GLSL uniform iSpeed（第二束以 0.2× 慢速错相）。
   */
  speed?: number;

  /**
   * 主光束颜色（第一束），CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 CSS 变量 `--color-chart-1` 取主题色，明暗自适应。
   */
  rayColor1?: string;

  /**
   * 辅光束颜色（第二束），CSS 颜色字符串。
   * 默认从 CSS 变量 `--color-chart-2` 取主题色，与主色叠加产生混色。
   */
  rayColor2?: string;

  /**
   * 整体亮度强度，默认 2。
   * 越大越亮、越靠近光源处越白；过大易过曝。
   */
  intensity?: number;

  /**
   * 光束张开角度（扇面宽度），默认 2。
   * 越大两束分得越开、覆盖面越广；越小越聚拢成一道。
   */
  spread?: number;

  /**
   * 光束发散的角落起点，默认 "top-right"。
   * 通过镜像翻转坐标实现四角任意起点。
   */
  origin?: SideRaysOrigin;

  /**
   * 光束整体倾斜角度（度），默认 0。
   * 围绕光源点旋转整个扇面，例：15 = 顺时针微倾。
   */
  tilt?: number;

  /**
   * 饱和度，默认 1.5。
   * 1 = 原色；>1 增艳；0 = 去色（灰阶光束）。
   */
  saturation?: number;

  /**
   * 两束混色比例（0–1），默认 0.75。
   * 0 = 仅主色；1 = 仅辅色；中间值为加权叠加。
   */
  blend?: number;

  /**
   * 亮度随距离衰减指数，默认 1.6。
   * 越大光源附近越集中、远处越快变暗；越小铺得越均匀。
   */
  falloff?: number;

  /**
   * 整体不透明度（0–1），默认 1。
   * 叠在内容背景上时常用 0.5–0.8 降低干扰。
   */
  opacity?: number;

  /**
   * 额外 className，透传到根容器（或 fallback div）。
   * 组件自带 `absolute inset-0 z-0`，可叠加调整透明度/混合模式。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的角向 radial-gradient 装饰 div（保留光束方位感）。
   */
  fallback?: ReactNode;
}
