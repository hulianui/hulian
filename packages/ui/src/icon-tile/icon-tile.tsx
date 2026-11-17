import { cva } from "class-variance-authority";
import { memo } from "react";
import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import type { IconTileProps } from "./icon-tile.types";

// 图标方块：功能列表、通知流、产品线卡片里「图标 + 一段文字」最左边那一格。
// 此前消费方每处手写 `grid size-9 place-items-center rounded-lg bg-… text-…`，尺寸 / 圆角 / 配色
// 各处不一；收成一个件后三档尺寸、三档变体、六档语义色与分类色都在这里。纯展示，可 RSC。
const BASE = "inline-grid shrink-0 place-items-center";
const SIZE = {
  sm: "size-8 rounded-lg [&>svg]:size-4",
  md: "size-9 rounded-lg [&>svg]:size-[18px]",
  lg: "size-10 rounded-xl [&>svg]:size-5",
} as const;
const OUTLINE_SHELL = "border border-border bg-surface";

export const iconTileVariants = cva(BASE, {
  variants: {
    size: SIZE,
    variant: { soft: "", solid: "", outline: OUTLINE_SHELL },
    tone: { brand: "", neutral: "", info: "", success: "", warning: "", danger: "" },
  },
  compoundVariants: [
    // soft：12% 语义底，与 Tag / Chip / Button soft 同一口径；中性档用 muted 底 + 次要灰。
    { variant: "soft", tone: "brand", class: "bg-primary/12 text-primary" },
    { variant: "soft", tone: "neutral", class: "bg-muted text-muted-foreground" },
    { variant: "soft", tone: "info", class: "bg-info/12 text-info" },
    { variant: "soft", tone: "success", class: "bg-success/12 text-success" },
    { variant: "soft", tone: "warning", class: "bg-warning/12 text-warning" },
    { variant: "soft", tone: "danger", class: "bg-danger/12 text-danger" },
    { variant: "solid", tone: "brand", class: "bg-primary text-primary-foreground" },
    { variant: "solid", tone: "neutral", class: "bg-foreground text-bg" },
    { variant: "solid", tone: "info", class: "bg-info text-info-foreground" },
    { variant: "solid", tone: "success", class: "bg-success text-success-foreground" },
    { variant: "solid", tone: "warning", class: "bg-warning text-warning-foreground" },
    { variant: "solid", tone: "danger", class: "bg-danger text-danger-foreground" },
    // outline：底与边是中性的，只有图标带语义色 —— 深色带 / 卡面上不想铺一块色时用。
    { variant: "outline", tone: "brand", class: "text-primary" },
    { variant: "outline", tone: "neutral", class: "text-muted-foreground" },
    { variant: "outline", tone: "info", class: "text-info" },
    { variant: "outline", tone: "success", class: "text-success" },
    { variant: "outline", tone: "warning", class: "text-warning" },
    { variant: "outline", tone: "danger", class: "text-danger" },
  ],
  defaultVariants: { size: "md", variant: "soft", tone: "brand" },
});

function IconTileImpl({
  tone = "brand",
  variant = "soft",
  size = "md",
  color,
  className,
  style,
  children,
  ...rest
}: IconTileProps) {
  const accent = resolveTone(color);
  // 分类色：三档都从这一个色派生，前景用 primary-foreground（与 Tag / Brand 的实底同一口径）。
  const accentStyle = accent
    ? variant === "solid"
      ? { backgroundColor: accent, color: "var(--color-primary-foreground)" }
      : variant === "outline"
        ? { color: accent }
        : { backgroundColor: `color-mix(in oklab, ${accent} 12%, transparent)`, color: accent }
    : undefined;
  // 有分类色时 tone 的配色类不再输出（避免与内联色互相打架）。
  const cls = accent
    ? cn(BASE, SIZE[size], variant === "outline" && OUTLINE_SHELL)
    : iconTileVariants({ size, variant, tone });
  return (
    <span
      // 装饰性：图标方块旁边总有文字说明它是什么。要单独表意时调用方传 aria-label + role="img"。
      aria-hidden={rest["aria-label"] == null ? true : undefined}
      className={cn(cls, className)}
      style={accentStyle ? { ...accentStyle, ...style } : style}
      {...rest}
    >
      {children}
    </span>
  );
}
IconTileImpl.displayName = "IconTile";

// 成排出现在列表 / 通知流里，props 全是原语，与 Tag / Brand 同一处方。
export const IconTile = memo(IconTileImpl);
IconTile.displayName = "IconTile";
