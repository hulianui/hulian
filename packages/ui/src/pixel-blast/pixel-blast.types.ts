import type { CSSProperties, ReactNode } from "react";

/** 像素方块的形状变体。 */
export type PixelBlastVariant = "square" | "circle" | "triangle" | "diamond";

export interface PixelBlastProps {
  /**
   * 像素单元的形状，默认 `"square"`。
   * - `square` 方块（最锐利的复古点阵质感）
   * - `circle` 圆点（柔和的网点印刷感）
   * - `triangle` 三角（错位翻转，制造织纹感）
   * - `diamond` 菱形（菱形网点）
   */
  variant?: PixelBlastVariant;

  /**
   * 单个像素方块的边长（CSS 像素），默认 4。
   * 越小点阵越密、越细腻；越大越粗犷复古。建议 2–12。
   */
  pixelSize?: number;

  /**
   * 像素主色，CSS 颜色字符串（hex / oklch / rgb / var(--…) 均可）。
   * 默认从 CSS 变量 `--color-primary` 取主题色，实现明暗自适应。
   */
  color?: string;

  /**
   * 噪声纹理缩放，默认 2。
   * 值越大斑块越细碎、闪烁越密；越小斑块越大、越宏观。建议 0.5–6。
   */
  patternScale?: number;

  /**
   * 像素填充密度，默认 1。
   * 越大亮起的像素越多（更"满"）；越小越稀疏。建议 0.4–1.6。
   */
  patternDensity?: number;

  /**
   * 每个像素方块尺寸的随机抖动幅度（0–1），默认 0。
   * 0 = 整齐网格；越大方块大小越参差，颗粒感越强。
   */
  pixelSizeJitter?: number;

  /**
   * 动画速度因子，越大噪声翻涌越快，默认 0.5。
   * 0 = 静止画面（仍渲染一帧静态点阵）。
   */
  speed?: number;

  /**
   * 四周渐隐宽度（0–1，相对于较短边的比例），默认 0.5。
   * 0 = 无渐隐（铺满硬边）；越大四角淡出越柔和，便于叠加内容。
   */
  edgeFade?: number;

  /**
   * 额外 className，透传到根容器 div（或 reduced-motion 兜底 div）。
   */
  className?: string;

  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;

  /**
   * reduced-motion / 无 WebGL 时渲染的静态替代内容。
   * 默认：吃 primary token 的 radial-gradient 点阵兜底（CSS mask 模拟像素网点）。
   */
  fallback?: ReactNode;
}
