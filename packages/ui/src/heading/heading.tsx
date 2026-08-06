import { memo } from "react";
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

function HeadingImpl<E extends ElementType = "div">({
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

HeadingImpl.displayName = "Heading";

// Heading 是每页几十处的排版原语，props 全是稳定原语时 React 无法自己 bailout ——
// 与 Button/Checkbox/Chip 同一处方（hulianui/hulian#89）。
// 泛型组件被 memo 包一层后 React 会把 E 擦成约束上界，这里断言回 HeadingImpl 的签名，
// 保住 `as` 多态下事件与属性跟着目标元素走的推导。
export const Heading = memo(HeadingImpl) as unknown as typeof HeadingImpl;
Heading.displayName = "Heading";
