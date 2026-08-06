import type { ElementType } from "react";
import { cn } from "../lib/cn";
import type { GridItemProps, GridProps, ResponsiveCols } from "./grid.types";

// 纯皮肤 grid 布局原语（可 RSC）。固定列数走 inline style（任意值）；响应式列数走静态 Tailwind 类。
const rem = (n?: number) => (n != null ? `${n * 0.25}rem` : undefined);

// 响应式列数静态类表（Tailwind 需静态字面量，覆盖 1-6 列足够实际场景）。
const COLS: Record<number, string> = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5", 6: "grid-cols-6" };
const SM: Record<number, string> = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4", 5: "sm:grid-cols-5", 6: "sm:grid-cols-6" };
const MD: Record<number, string> = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 5: "md:grid-cols-5", 6: "md:grid-cols-6" };
const LG: Record<number, string> = { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 6: "lg:grid-cols-6" };
// xl/2xl 档：中后台宽屏（≥1280）恰恰最需要多分一列，档位止于 lg 会逼消费方
// 一半走 prop 一半走 className（hulianui/hulian#61）。
const XL: Record<number, string> = { 1: "xl:grid-cols-1", 2: "xl:grid-cols-2", 3: "xl:grid-cols-3", 4: "xl:grid-cols-4", 5: "xl:grid-cols-5", 6: "xl:grid-cols-6" };
const XXL: Record<number, string> = { 1: "2xl:grid-cols-1", 2: "2xl:grid-cols-2", 3: "2xl:grid-cols-3", 4: "2xl:grid-cols-4", 5: "2xl:grid-cols-5", 6: "2xl:grid-cols-6" };

function responsiveColsClass(c: ResponsiveCols): string {
  return cn(
    c.base && COLS[c.base],
    c.sm && SM[c.sm],
    c.md && MD[c.md],
    c.lg && LG[c.lg],
    c.xl && XL[c.xl],
    c["2xl"] && XXL[c["2xl"]],
  );
}

export function Grid<E extends ElementType = "div">({
  cols: colsProp,
  rows,
  gap = 0,
  colGap,
  rowGap,
  inline = false,
  as,
  className,
  style,
  ...props
}: GridProps<E>) {
  const Comp = (as ?? "div") as ElementType;
  // 解构默认只在 undefined 时生效，而 typeof null === "object" 会把 null 送进响应式分支；
  // 由 LLM 产出结构的消费方常把「不设这个 prop」写成 null（hulianui/hulian#107）。
  const cols = colsProp ?? 1;
  const responsive = typeof cols === "object";
  return (
    <Comp
      className={cn(inline ? "inline-grid" : "grid", responsive && responsiveColsClass(cols), className)}
      style={{
        gridTemplateColumns: responsive ? undefined : `repeat(${cols as number}, minmax(0, 1fr))`,
        gridTemplateRows: rows ? `repeat(${rows}, minmax(0, 1fr))` : undefined,
        columnGap: rem(colGap ?? gap),
        rowGap: rem(rowGap ?? gap),
        ...(style as object),
      }}
      {...props}
    />
  );
}

export function GridItem<E extends ElementType = "div">({
  colSpan,
  rowSpan,
  as,
  className,
  style,
  ...props
}: GridItemProps<E>) {
  const Comp = (as ?? "div") as ElementType;
  return (
    <Comp
      className={cn(className)}
      style={{
        gridColumn: colSpan ? `span ${colSpan} / span ${colSpan}` : undefined,
        gridRow: rowSpan ? `span ${rowSpan} / span ${rowSpan}` : undefined,
        ...(style as object),
      }}
      {...props}
    />
  );
}
