import { cn } from "../lib/cn";
import type { ResponsiveDirection, StackAlign, StackDirection, StackJustify, StackProps } from "./stack.types";

// 纯皮肤 flex 布局原语（可 RSC）。direction/align/justify 走静态类，gap 走 inline style（对齐 Tailwind spacing 刻度）。
const DIR: Record<StackDirection, string> = { row: "flex-row", column: "flex-col" };
const DIR_SM: Record<StackDirection, string> = { row: "sm:flex-row", column: "sm:flex-col" };
const DIR_MD: Record<StackDirection, string> = { row: "md:flex-row", column: "md:flex-col" };
const DIR_LG: Record<StackDirection, string> = { row: "lg:flex-row", column: "lg:flex-col" };

function directionClass(d: StackDirection | ResponsiveDirection): string {
  if (typeof d === "string") return DIR[d];
  return cn(d.base && DIR[d.base], d.sm && DIR_SM[d.sm], d.md && DIR_MD[d.md], d.lg && DIR_LG[d.lg]);
}

const ALIGN: Record<StackAlign, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const JUSTIFY: Record<StackJustify, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

export function Stack({
  direction = "column",
  gap = 0,
  align,
  justify,
  wrap = false,
  inline = false,
  as,
  className,
  style,
  ...props
}: StackProps) {
  const Comp = as ?? "div";
  return (
    <Comp
      className={cn(
        inline ? "inline-flex" : "flex",
        directionClass(direction),
        wrap && "flex-wrap",
        align && ALIGN[align],
        justify && JUSTIFY[justify],
        className,
      )}
      style={{ gap: gap ? `${gap * 0.25}rem` : undefined, ...style }}
      {...props}
    />
  );
}
