import { cn } from "../lib/cn";
import type { StackAlign, StackJustify, StackProps } from "./stack.types";

// 纯皮肤 flex 布局原语（可 RSC）。direction/align/justify 走静态类，gap 走 inline style（对齐 Tailwind spacing 刻度）。
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
        direction === "row" ? "flex-row" : "flex-col",
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
