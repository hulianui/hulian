import type { ComponentPropsWithoutRef } from "react";

export interface TrueFocusProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** 整句文本，按 `separator` 切词后逐词聚焦。默认 `"True Focus"`。 */
  sentence?: string;
  /** 切词分隔符（传给 `String.prototype.split`）。默认空格 `" "`。 */
  separator?: string;
  /** 失焦词的模糊半径（px）。默认 `5`。 */
  blurAmount?: number;
  /**
   * 四角括号描边色（CSS color，建议吃 token）。默认 `"var(--color-chart-1)"`。
   * 自定义务必带 `--color-` 前缀或合法 CSS 颜色——裸 `var(--primary)` 在本 Tailwind v4 设定下不解析。
   */
  borderColor?: string;
  /** 单次对焦切换的动画 / 停留秒数。默认 `1.2`。 */
  animationDuration?: number;
  /** 自动模式下两次切换之间的停顿（秒）。默认 `0.6`。 */
  pauseBetweenAnimations?: number;
  /**
   * 手动模式：为 `true` 时不自动轮播，改由鼠标悬停某词来对焦。默认 `false`（自动循环）。
   */
  manualMode?: boolean;
}
