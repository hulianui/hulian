import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";

/** 皮肤：solid 双色实底（shields.io 观感）/ soft 柔和填充（嵌进文档正文不抢戏）/ outline 描边。 */
export type ShieldBadgeVariant = "solid" | "soft" | "outline";

/** 右段语气。自定义色走 `color`（任意 CSS 色 / chart-1..6），优先级高于 tone。 */
export type ShieldBadgeTone = "neutral" | "brand" | "success" | "warning" | "danger";

/** 外形：rounded 圆角矩形（默认，对齐 shields flat）/ square 直角 / pill 全圆。 */
export type ShieldBadgeShape = "rounded" | "square" | "pill";

export type ShieldBadgeSize = "sm" | "md";

export interface ShieldBadgeProps
  extends Omit<HTMLAttributes<HTMLElement>, "color" | "children"> {
  /** 左段（灰底），如 `license` / `downloads` / `CI`。省略则退化为单段徽章。 */
  label?: ReactNode;
  /** 右段（彩底），如 `MIT` / `1.5k/month` / `failing`。 */
  value: ReactNode;
  /** 前置 logo 槽：有 label 时放在左段最前，否则放在右段最前（自动 aria-hidden）。 */
  icon?: ReactNode;
  /** @default "brand" */
  tone?: ShieldBadgeTone;
  /** 逃生舱：任意 CSS 色 / 语义色名（chart-1..6 等），覆盖 tone。 */
  color?: string;
  /** @default "solid" */
  variant?: ShieldBadgeVariant;
  /** @default "md" */
  size?: ShieldBadgeSize;
  /** @default "rounded" */
  shape?: ShieldBadgeShape;
  /** 整枚徽章可点：渲染为 `<a>`，带 hover/按压/焦点环。 */
  href?: string;
  /** 配合 href；`_blank` 时自动补 rel="noreferrer noopener"。 */
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: string;
  className?: string;
}

export interface ShieldBadgeGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** 徽章间距。@default "sm" */
  gap?: "sm" | "md";
  children?: ReactNode;
}
