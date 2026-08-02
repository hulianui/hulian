import type { HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import type { dotVariants } from "./dot";

export type DotTone = "neutral" | "brand" | "success" | "warning" | "danger";

export interface DotProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "color">,
    VariantProps<typeof dotVariants> {
  /** 语气色：neutral 默认 / brand 处理中 / success 在线/成功 / warning 警告 / danger 离线/错误。 */
  tone?: DotTone;
  /**
   * 任意圆点色：语义色名（`chart-2` / `primary` …）、任意 CSS 颜色或变量，走 `resolveTone`
   * ——与 `Brand.color` / `ChartSeries.color` 同一条路径。图例圆点要跟序列同色时用它。
   * 与 `tone` 同时传时 `color` 优先（`tone` 是五档语义快捷方式）。
   *
   * 注意：`style={{ color }}` **不会**改圆点颜色（圆点是背景色，`color` 管的是文字色），
   * 那种写法编译通过、页面上一律灰点。要自定义颜色只走本 prop。
   */
  color?: string;
  /** 呼吸扩散动画（在线 / 进行中 等活跃态语义）。 */
  pulse?: boolean;
  /** 无障碍标签：提供则 role=status + aria-label（表意圆点，如「在线」）；不提供则 aria-hidden（纯装饰）。 */
  label?: string;
}
