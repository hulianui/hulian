import type { ComponentPropsWithoutRef } from "react";

export interface LineShadowTextProps extends Omit<ComponentPropsWithoutRef<"span">, "children"> {
  /** 要加投影的文字。只接受字符串：投影层是同一段文字的副本，非文本节点没法复刻。 */
  children: string;

  /**
   * 投影色，默认 `var(--color-foreground)`（跟随明暗主题）。
   * 喂 token 必须带 `--color-` 前缀，裸 `var(--primary)` 在 Tailwind v4 的 `@theme` 里不解析。
   */
  shadowColor?: string;

  /** 投影相对本体的偏移量，默认 `0.04em`（随字号缩放，所以大标题小标题都成比例）。 */
  offset?: string;

  /** 斜线的粗细/间距，默认 `0.06em`。调大变成粗条纹，调小接近实心影。 */
  lineWidth?: string;

  /**
   * 让斜线沿对角缓慢流动，默认 `false`。
   *
   * 默认静态是刻意的：这一档在文字特效族里的定位就是「最克制的那个」——
   * 打印页、企业官网、reduced-motion 环境都能用。要动效时再显式开。
   * 开了也仍然尊重系统的 `prefers-reduced-motion`。
   */
  animated?: boolean;

  /** 一轮流动的秒数，默认 `15s`；仅 `animated` 为真时生效。 */
  duration?: string;
}
