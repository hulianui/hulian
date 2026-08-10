import { memo } from "react";
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
  muted: "text-muted-foreground",
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

function TextImpl<E extends ElementType = "div">({
  as,
  size = "base",
  tone = "default",
  weight = "normal",
  truncate = false,
  lineClamp,
  className,
  style,
  ...props
}: TextProps<E>) {
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

TextImpl.displayName = "Text";

// Text 是全站密度最高的排版原语，props 全是稳定原语时 React 无法自己 bailout ——
// 与 Button/Checkbox/Chip 同一处方（hulianui/hulian#89）。
// 泛型组件被 memo 包一层后 React 会把 E 擦成约束上界，这里断言回 TextImpl 的签名，
// 保住 `as` 多态下事件与属性跟着目标元素走的推导。
export const Text = memo(TextImpl) as unknown as typeof TextImpl;
Text.displayName = "Text";
