import type { ElementType } from "react";
import { cn } from "../lib/cn";
import type { HeadingLevel, HeadingProps, HeadingSize, HeadingWeight } from "./heading.types";

// 纯皮肤多态语义标题（可 RSC，本体不加 "use client"）。
// 只消费语义 token（text-foreground）；尺寸/字重走静态映射，level 同时决定语义标签与默认视觉尺寸。
const SIZE: Record<HeadingSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

const WEIGHT: Record<HeadingWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

// level → 默认视觉尺寸（可被 size 显式覆盖，实现视觉/语义解耦）。
const SIZE_BY_LEVEL: Record<HeadingLevel, HeadingSize> = {
  1: "4xl",
  2: "3xl",
  3: "2xl",
  4: "xl",
  5: "lg",
  6: "base",
};

export function Heading<E extends ElementType = "div">({
  level = 2,
  as,
  size,
  weight = "semibold",
  balance = false,
  className,
  ...props
}: HeadingProps<E>) {
  const Comp = (as ?? `h${level}`) as ElementType;
  const resolvedSize = size ?? SIZE_BY_LEVEL[level];
  return (
    <Comp
      className={cn(
        "text-foreground tracking-tight",
        SIZE[resolvedSize],
        WEIGHT[weight],
        balance && "text-balance",
        className,
      )}
      {...props}
    />
  );
}
