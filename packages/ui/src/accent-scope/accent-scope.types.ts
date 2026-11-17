import type { ComponentPropsWithoutRef } from "react";

export interface AccentScopeProps extends ComponentPropsWithoutRef<"div"> {
  /**
   * 子树主色的 OKLCH 色相（0–360）。明度 / 彩度沿用品牌梯子，只换色相。
   * 省略时取 tokens 里注册的初值 258（品牌原色）。
   */
  hue?: number;
  /**
   * 换色相时的过渡时长（毫秒）；`0` 关闭过渡、瞬时换色。
   * 过渡的是 `--hl-accent-hue` 这一个变量，子树里所有派生色同步渐变，
   * 子元素不要再给同一个变量挂过渡，否则每帧都会重起一段、变色拖尾。
   * @default 0
   */
  transition?: number;
  /**
   * 把主题写在作用域同一个元素上。只有「暗页 > 亮色岛 > 作用域」这类嵌套需要它：
   * 两个祖先主题选择器特异性相同，不写在同一元素上会按源码顺序落到暗色。
   */
  theme?: "light" | "dark";
}
