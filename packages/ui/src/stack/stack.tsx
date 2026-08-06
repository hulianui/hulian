import type { ElementType } from "react";
import { cn } from "../lib/cn";
import type { ResponsiveDirection, StackAlign, StackDirection, StackJustify, StackProps } from "./stack.types";

// 纯皮肤 flex 布局原语（可 RSC）。direction/align/justify 走静态类，gap 走 inline style（对齐 Tailwind spacing 刻度）。
// 断点表铺满 Tailwind 的 sm/md/lg/xl/2xl —— 中后台宽屏（≥1280）恰恰最需要在 xl 档换方向/加列，
// 档位止于 lg 会逼消费方一半走 prop 一半走 className（hulianui/hulian#61）。
const DIR: Record<StackDirection, string> = { row: "flex-row", column: "flex-col" };
const DIR_SM: Record<StackDirection, string> = { row: "sm:flex-row", column: "sm:flex-col" };
const DIR_MD: Record<StackDirection, string> = { row: "md:flex-row", column: "md:flex-col" };
const DIR_LG: Record<StackDirection, string> = { row: "lg:flex-row", column: "lg:flex-col" };
const DIR_XL: Record<StackDirection, string> = { row: "xl:flex-row", column: "xl:flex-col" };
const DIR_2XL: Record<StackDirection, string> = { row: "2xl:flex-row", column: "2xl:flex-col" };

// 默认方向的唯一真源：解构默认只在 undefined 时生效，而由 LLM 产出结构再动态渲染的消费方
// 常把「不设这个 prop」写成 null（JSON 里最自然的写法），故默认值统一在这里兜（hulianui/hulian#107）。
function directionClass(d: StackDirection | ResponsiveDirection | null | undefined): string {
  if (d == null) return DIR.column;
  if (typeof d === "string") return DIR[d];
  return cn(
    d.base && DIR[d.base],
    d.sm && DIR_SM[d.sm],
    d.md && DIR_MD[d.md],
    d.lg && DIR_LG[d.lg],
    d.xl && DIR_XL[d.xl],
    d["2xl"] && DIR_2XL[d["2xl"]],
  );
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

export function Stack<E extends ElementType = "div">({
  direction,
  gap = 0,
  align,
  justify,
  wrap = false,
  inline = false,
  as,
  className,
  style,
  ...props
}: StackProps<E>) {
  const Comp = (as ?? "div") as ElementType;
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
      style={{ gap: gap ? `${gap * 0.25}rem` : undefined, ...(style as object) }}
      {...props}
    />
  );
}
