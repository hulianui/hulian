import { cn } from "../lib/cn";
import type { GridItemProps, GridProps } from "./grid.types";

// 纯皮肤 grid 布局原语（可 RSC）。列数/跨度走 inline style（动态值无法预生成 Tailwind 类），间距对齐 spacing 刻度。
const rem = (n?: number) => (n != null ? `${n * 0.25}rem` : undefined);

export function Grid({
  cols = 1,
  rows,
  gap = 0,
  colGap,
  rowGap,
  inline = false,
  as,
  className,
  style,
  ...props
}: GridProps) {
  const Comp = as ?? "div";
  return (
    <Comp
      className={cn(inline ? "inline-grid" : "grid", className)}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridTemplateRows: rows ? `repeat(${rows}, minmax(0, 1fr))` : undefined,
        columnGap: rem(colGap ?? gap),
        rowGap: rem(rowGap ?? gap),
        ...style,
      }}
      {...props}
    />
  );
}

export function GridItem({ colSpan, rowSpan, as, className, style, ...props }: GridItemProps) {
  const Comp = as ?? "div";
  return (
    <Comp
      className={cn(className)}
      style={{
        gridColumn: colSpan ? `span ${colSpan} / span ${colSpan}` : undefined,
        gridRow: rowSpan ? `span ${rowSpan} / span ${rowSpan}` : undefined,
        ...style,
      }}
      {...props}
    />
  );
}
