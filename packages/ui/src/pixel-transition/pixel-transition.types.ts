import type { CSSProperties, ReactNode } from "react";

export interface PixelTransitionProps {
  /** 默认（静止）态展示的内容，通常是一张图 / 一段文案。 */
  firstContent: ReactNode;
  /** 激活态展示的内容，悬停 / 聚焦 / 点击后透过像素幕布显露。 */
  secondContent: ReactNode;
  /**
   * 像素网格边长（每行 / 每列的像素块数），总块数为 gridSize²。
   * 越大越细腻、过场越「软」；越小越粗粝、越有马赛克感。
   * @default 7
   */
  gridSize?: number;
  /**
   * 像素块填色。建议用瑚琏 token 变量（如 `var(--color-foreground)`、`var(--color-primary)`）；
   * `currentColor` 则跟随容器文字色。
   * @default "var(--color-foreground)"
   */
  pixelColor?: string;
  /**
   * 单次过场时长（秒）：像素散入 + 散出各占一半，内容在中点切换。
   * @default 0.3
   */
  animationStepDuration?: number;
  /**
   * 只进不退：激活后停在 secondContent，离开 / 失焦不再返回 firstContent。
   * @default false
   */
  once?: boolean;
  /**
   * 容器宽高比，CSS `aspect-ratio` 写法（如 `"4 / 3"`、`"1 / 1"`、`"16 / 9"`）。
   * @default "4 / 3"
   */
  aspectRatio?: string;
  /** 透传到根元素的类名，cn 合并。 */
  className?: string;
  /** 透传到根元素的内联样式。 */
  style?: CSSProperties;
}
