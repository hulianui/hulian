import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";

/** 皮肤：outline 描边（默认，对齐 GitHub Trending / Product Hunt 奖章观感）/ solid 实底 / soft 柔和。 */
export type AwardBadgeVariant = "outline" | "solid" | "soft";

export type AwardBadgeTone = "brand" | "neutral" | "success" | "warning" | "danger";

export type AwardBadgeSize = "sm" | "md" | "lg";

export interface AwardBadgeProps
  // title 与原生 title 属性同名但类型更宽（ReactNode），须 Omit 掉再声明自己的。
  extends Omit<HTMLAttributes<HTMLElement>, "color" | "title" | "children"> {
  /** 主标题，如 `#1 Repository Of The Day`。 */
  title: ReactNode;
  /** 上行小字（自动大写 + 字距），如 `GITHUB TRENDING`。 */
  kicker?: ReactNode;
  /** 桂冠中央的名次，如 `1`；省略则花环留空。 */
  rank?: ReactNode;
  /** 整枚徽记槽：传了就替换「桂冠 + 名次」（放奖杯图标 / 平台 logo）。 */
  emblem?: ReactNode;
  /** 是否画桂冠。@default true */
  wreath?: boolean;
  /** @default "outline" */
  variant?: AwardBadgeVariant;
  /** @default "brand" */
  tone?: AwardBadgeTone;
  /** 逃生舱：任意 CSS 色 / 语义色名（`chart-1`..`chart-6`），覆盖 tone。 */
  color?: string;
  /** @default "md" */
  size?: AwardBadgeSize;
  /** 整枚可点：渲染为 `<a>`，带 hover/按压/焦点环。 */
  href?: string;
  /** 配合 href；`_blank` 时自动补 rel="noreferrer noopener"。 */
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: string;
  className?: string;
}
