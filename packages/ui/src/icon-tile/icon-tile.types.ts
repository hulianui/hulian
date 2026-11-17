import type { HTMLAttributes, ReactNode } from "react";

export type IconTileTone = "brand" | "neutral" | "info" | "success" | "warning" | "danger";

export interface IconTileProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
  /** 语义色档。@default "brand" */
  tone?: IconTileTone;
  /**
   * `soft` 浅语义底 + 语义色图标（默认）；`solid` 实心语义底 + 前景色图标；
   * `outline` 中性描边卡面底 + 语义色图标（深色带 / 卡面上更克制的一档）。
   * @default "soft"
   */
  variant?: "soft" | "solid" | "outline";
  /** `sm` 32px / `md` 36px / `lg` 40px，图标尺寸随档。@default "md" */
  size?: "sm" | "md" | "lg";
  /**
   * 分类色：语义色名（`chart-3` …）、任意 CSS 色或 `var(--color-*)`。给了就覆盖 `tone`，
   * 三档 variant 都从这一个色派生（同 Tag 的 `color`）。
   */
  color?: string;
  /** 图标（lucide 等 SVG 图标，尺寸由组件按档给，不必自己写 size 类）。 */
  children?: ReactNode;
}
