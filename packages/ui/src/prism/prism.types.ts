import type { ReactNode } from "react";

/** Prism 的动画模式。 */
export type PrismAnimationType = "rotate" | "3drotate" | "hover";

export interface PrismProps {
  /**
   * 棱锥高度（沿 Y 轴），默认 3.5。
   * 值越大棱锥越高耸、光柱越细长。
   */
  height?: number;

  /**
   * 棱锥底边宽度，默认 5.5。
   * 与 height 共同决定棱锥的胖瘦比例。
   */
  baseWidth?: number;

  /**
   * 动画模式，默认 `"rotate"`：
   * - `"rotate"`：底面在 XZ 平面做正弦摆动（轻盈呼吸感，无整体旋转）。
   * - `"3drotate"`：棱锥沿三轴做有机的伪随机三维旋转。
   * - `"hover"`：跟随全局指针，棱锥朝光标方向倾斜（带惯性缓动）。
   */
  animationType?: PrismAnimationType;

  /**
   * 体积光辉强度，默认 1。
   * 越大棱镜内部辉光越亮，0 = 无辉光（暗轮廓）。
   */
  glow?: number;

  /**
   * 像素偏移，默认 `{ x: 0, y: 0 }`。
   * 把棱锥从画面正中心平移（CSS 像素），用于构图避让内容。
   */
  offset?: { x?: number; y?: number };

  /**
   * 颗粒噪声强度，默认 0.5。
   * 叠加电影感胶片颗粒，0 = 纯净无颗粒。
   */
  noise?: number;

  /**
   * 是否透明背景，默认 true。
   * true 时画布 alpha 透出底色，且自动提升饱和度（更通透）。
   */
  transparent?: boolean;

  /**
   * 棱镜整体缩放，默认 3.6。
   * 值越大棱镜在画面中越大（占据更多视口）。
   */
  scale?: number;

  /**
   * 色相旋转（弧度），默认从主题 `--color-chart-1` 自动推导，使棱镜分光偏向主题强调色。
   * 显式传值会在自动推导的基础上叠加偏移。
   */
  hueShift?: number;

  /**
   * 分光色彩频率，默认 1。
   * 越大彩虹条纹越密集，越小色带越宽。
   */
  colorFrequency?: number;

  /**
   * `hover` 模式下的跟随强度，默认 2。
   * 越大棱锥朝光标倾斜的幅度越大。
   */
  hoverStrength?: number;

  /**
   * `hover` 模式下的惯性系数（0–1），默认 0.05。
   * 越小越「黏滞」（缓动越久），越大越「跟手」。
   */
  inertia?: number;

  /**
   * 泛光叠加，默认 1。
   * 与 glow 相乘放大整体亮度，用于压暗/提亮成片观感。
   */
  bloom?: number;

  /**
   * 时间缩放（动画整体速度），默认 0.5。
   * 0 = 冻结为静态一帧（`rotate` / `3drotate` 会停在初始姿态）。
   */
  timeScale?: number;

  /**
   * 额外 className，透传到根容器（或 reduced-motion fallback div）。
   */
  className?: string;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 chart token 的径向辉光渐变 div（保留棱镜的色感）。
   */
  fallback?: ReactNode;
}
