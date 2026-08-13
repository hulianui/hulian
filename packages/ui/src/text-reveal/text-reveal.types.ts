import type { ComponentPropsWithoutRef } from "react";

export interface TextRevealProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /**
   * 要揭示的文字。
   *
   * 传数组时**多串轮换**（每扫完一轮换下一串，需配 `repeat`），并且容器宽度按最宽的那串预留
   * ——否则换串那一刻宽度突变，紧挨着的元素会跟着跳。预留是靠把所有串叠在同一个网格单元里
   * 实现的，不测量、不写死，换字体换字号都不会失准。
   */
  text: string | string[];

  /**
   * 扫光带的颜色，默认 chart-1..5 五色（吃主题，明暗都成立）。
   * 传单色即单色带。颜色变量要带 `--color-` 前缀，裸 `var(--primary)` 不解析。
   */
  colors?: string[];

  /** 已揭示部分的文字色，默认 `var(--color-foreground)`。**不能传 `currentColor`**，见文档「禁忌」。 */
  textColor?: string;

  /** 扫完一轮的秒数，默认 `2`。 */
  duration?: number;

  /**
   * 循环扫。默认 `false`（扫一轮停在全部揭示的终态）。
   *
   * 「进行中」语义的状态文字要开这个：动画停下来本身就是错误信号——用户是靠它还在动
   * 来判断后台任务没死（#255）。
   */
  repeat?: boolean;

  /**
   * 滚入视口才开始，默认 `true`（进场用法）。
   *
   * 侧边栏里的任务态标签常常一开始就在视口内，那种场景传 `false` 立刻开扫。
   */
  startOnView?: boolean;

  /**
   * 只扫一次，默认 `true`。传 `false` 则每次滚回视口都重扫一轮。
   * 仅在 `startOnView` 为 `true` 时有意义。
   */
  once?: boolean;
}
