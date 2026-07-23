import type { CSSProperties, ElementType } from "react";
import { cn } from "../lib/cn";
import type { TextProps, TextSize, TextTone, TextWeight } from "./text.types";

// 纯皮肤多态文本（可 RSC，本体不加 "use client"）。
// size/tone/weight 走静态类映射，全消费语义 token（明暗自适配）；
// lineClamp 走 inline style（行数动态，避免 Tailwind 动态类被 purge），且优先于 truncate。
const SIZE: Record<TextSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

const TONE: Record<TextTone, string> = {
  default: "text-foreground",
  muted: "text-muted",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

const WEIGHT: Record<TextWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

export function Text({
  as,
  size = "base",
  tone = "default",
  weight = "normal",
  truncate = false,
  lineClamp,
  className,
  style,
  ...props
}: TextProps) {
  const Comp = (as ?? "p") as ElementType;
  const clampStyle: CSSProperties | undefined = lineClamp
    ? {
        display: "-webkit-box",
        WebkitBoxOrient: "vertical",
        WebkitLineClamp: lineClamp,
        overflow: "hidden",
      }
    : undefined;
  return (
    <Comp
      className={cn(
        SIZE[size],
        TONE[tone],
        WEIGHT[weight],
        truncate && !lineClamp && "truncate",
        className,
      )}
      style={{ ...clampStyle, ...style }}
      {...props}
    />
  );
}
