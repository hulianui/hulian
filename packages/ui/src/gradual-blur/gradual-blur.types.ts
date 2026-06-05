import type { CSSProperties, ReactNode } from "react";

/** 渐进模糊贴边的方向：上 / 下 / 左 / 右。 */
export type GradualBlurPosition = "top" | "bottom" | "left" | "right";

/** 模糊层进度曲线（决定每层模糊量的爬升节奏）。 */
export type GradualBlurCurve =
  | "linear"
  | "bezier"
  | "ease-in"
  | "ease-out"
  | "ease-in-out";

export interface GradualBlurProps {
  /**
   * 模糊层贴靠的边，默认 "bottom"。
   * - "top" / "bottom"：水平横条，占满宽度，高度由 `height` 决定。
   * - "left" / "right"：垂直竖条，占满高度，宽度由 `width`（缺省取 `height`）决定。
   */
  position?: GradualBlurPosition;
  /**
   * 模糊强度基数，默认 2。每一层在此基础上按曲线递增，越大越糊。
   * 建议范围 1–6。
   */
  strength?: number;
  /**
   * 横条模式下的厚度（CSS 尺寸，如 "6rem"），默认 "6rem"。
   * 竖条模式下若未传 `width` 则复用此值作为竖条宽度。
   */
  height?: string;
  /**
   * 竖条模式（left/right）下的宽度（CSS 尺寸），缺省回落到 `height`。
   */
  width?: string;
  /**
   * 叠加的模糊层数量，默认 5。层数越多过渡越细腻、性能开销越大。
   * 建议范围 3–10。
   */
  divCount?: number;
  /**
   * 是否指数级递增模糊量（近边缘急剧变糊），默认 false（线性递增）。
   */
  exponential?: boolean;
  /**
   * 每层模糊量沿进度的爬升曲线，默认 "linear"。
   */
  curve?: GradualBlurCurve;
  /**
   * 整体不透明度，默认 1。
   */
  opacity?: number;
  /**
   * 鼠标悬停时模糊强度的放大倍数（如 1.5）。传入则启用悬停增强，
   * 同时根容器会接管指针事件（pointer-events: auto）以捕获 hover。
   * 不传则容器 pointer-events: none，完全不挡下层交互。
   */
  hoverIntensity?: number;
  /**
   * 进入视口时淡入（IntersectionObserver 驱动），默认 false。
   * 开启后默认不可见，滚动进入视口后按 reduced-motion 友好的方式淡入。
   */
  revealOnScroll?: boolean;
  /**
   * 淡入过渡时长（CSS 时间，如 "0.3s"），默认 "0.3s"。仅在 `revealOnScroll` 时生效。
   */
  duration?: string;
  /**
   * 叠加的 z-index，默认 10。
   */
  zIndex?: number;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式（会与组件内部计算样式合并，同名以此为准）。
   */
  style?: CSSProperties;
  /**
   * 覆盖在模糊层之上的内容（如贴边的标题/操作条），relative 层叠在模糊之上。
   */
  children?: ReactNode;
}
