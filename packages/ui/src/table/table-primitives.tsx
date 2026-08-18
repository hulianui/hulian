"use client";
import { createContext, useContext } from "react";
import { cn } from "../lib/cn";
import type { CSSProperties } from "react";
import type {
  TableBodyProps,
  TableCellProps,
  TableCellWhitespace,
  TableColumnAlign,
  TableDensity,
  TableFooterProps,
  TableHeadProps,
  TableHeaderProps,
  TablePrimitiveWidthProps,
  TableRootProps,
  TableRowProps,
} from "./table.types";

/**
 * 组合原语（#241）：结构由业务自己写，只借库的表格皮肤。
 *
 * 存在的理由不是「Table 不够用」，而是**配置表达不了结构**：一行里嵌两层、整行是一个编辑器、
 * 按数据把一条拆成三行 —— 这些写成 `ColumnDef[]` 就是把可读的表格结构翻译进 `cell` 回调，
 * 代码只会更难读。所以两条路并存：数据驱动 + 要排序/分页/冻结列走高层 `Table`；
 * 结构自定义、只要皮肤与 token 一致走这里。
 *
 * 皮肤口径与高层 `Table` 同源（见下面两个 context 与 TABLE_DENSITY_PAD）——
 * 这正是原语的意义：不能是「长得差不多的另一套」。
 */

/** 密度 → 单元格内边距。高层 `Table` 与原语共用这一份，避免两套皮肤漂移。 */
export const TABLE_DENSITY_PAD: Record<TableDensity, string> = {
  default: "px-3 py-2",
  middle: "px-3 py-1.5",
  compact: "px-2 py-1",
};

/** 换行策略 → 类名（#194 / #285）。高层 `Table` 与原语共用这一份，换行是皮肤的一部分，不能两边各写一套。 */
export const TABLE_WHITESPACE_CLASS: Record<TableCellWhitespace, string> = {
  nowrap: "whitespace-nowrap",
  normal: "whitespace-normal break-words",
  "pre-wrap": "whitespace-pre-wrap break-words",
};

const ALIGN_TEXT = { left: "text-left", center: "text-center", right: "text-right" } as const;
const VALIGN_CLASS = { top: "align-top", middle: "align-middle", bottom: "align-bottom" } as const;

/**
 * 原语列宽（#286）：数据驱动的列宽只能落 inline style（`w-[${px}px]` 不编译、`<col>` 只在 fixed 下可靠且给不了 maxWidth），
 * 消费方直接写 `style` 又会被 guard 的 no-style-override 拦下 —— 所以入口必须是 prop，由原语代落。
 * 消费方自己的 `style` 仍透传，且优先级更高（明写的就是想覆盖）。
 */
function widthStyle(
  { width, minWidth, maxWidth }: TablePrimitiveWidthProps,
  style: CSSProperties | undefined,
): CSSProperties | undefined {
  if (width == null && minWidth == null && maxWidth == null) return style;
  return {
    ...(width != null ? { width } : null),
    ...(minWidth != null ? { minWidth } : null),
    ...(maxWidth != null ? { maxWidth } : null),
    ...style,
  };
}

/** 表级皮肤（由 TableRoot 下发）。原语是散件，逐个传 density 必然漂。 */
const TableSkinContext = createContext<{
  density: TableDensity;
  striped: boolean;
  cellWhitespace?: TableCellWhitespace;
  cellAlign?: TableColumnAlign;
  headerAlign?: TableColumnAlign;
}>({
  density: "default",
  striped: false,
});

/**
 * 所在段（由 TableHeader / TableBody / TableFooter 下发）。
 * `<tr>` 在表头与表体里的皮肤本就不同（表头不 hover、不斑马纹，也不能 `last:border-0`——
 * 单行表头就是最后一行，那条规则会把表头底边线抹掉），让消费方自己记这个差别是错的分工。
 */
const TableSectionContext = createContext<"head" | "body" | "foot">("body");

export function TableRoot({
  density = "default",
  striped = false,
  bordered = true,
  layout = "auto",
  minWidth,
  tableClassName,
  cellWhitespace,
  cellAlign,
  headerAlign,
  className,
  children,
  ...rest
}: TableRootProps) {
  return (
    <div
      className={cn(
        bordered && "rounded-[var(--radius)] border border-border",
        "overflow-x-auto",
        className,
      )}
      {...rest}
    >
      <TableSkinContext.Provider value={{ density, striped, cellWhitespace, cellAlign, headerAlign }}>
        <table
          style={{
            ...(layout === "fixed" ? { tableLayout: "fixed" as const } : null),
            ...(minWidth != null ? { minWidth } : null),
          }}
          className={cn("w-full border-collapse text-sm", tableClassName)}
        >
          {children}
        </table>
      </TableSkinContext.Provider>
    </div>
  );
}

export function TableHeader({ className, children, ...rest }: TableHeaderProps) {
  return (
    <thead className={cn("text-foreground", className)} {...rest}>
      <TableSectionContext.Provider value="head">{children}</TableSectionContext.Provider>
    </thead>
  );
}

export function TableBody({ children, ...rest }: TableBodyProps) {
  return (
    <tbody {...rest}>
      <TableSectionContext.Provider value="body">{children}</TableSectionContext.Provider>
    </tbody>
  );
}

export function TableFooter({ className, children, ...rest }: TableFooterProps) {
  return (
    <tfoot
      className={cn("border-t border-border bg-surface-hover/50 font-medium text-foreground", className)}
      {...rest}
    >
      <TableSectionContext.Provider value="foot">{children}</TableSectionContext.Provider>
    </tfoot>
  );
}

export function TableRow({ selected, className, ...rest }: TableRowProps) {
  const { striped } = useContext(TableSkinContext);
  const section = useContext(TableSectionContext);
  return (
    <tr
      data-selected={selected || undefined}
      className={cn(
        "border-b border-border",
        // 表头只有一行时它同时是最后一行，last:border-0 会把表头底边线抹掉
        section !== "head" && "last:border-0",
        section === "body" && "transition-colors hover:bg-surface-hover",
        section === "body" && striped && "even:bg-surface-hover/40",
        selected && "bg-primary/10 hover:bg-primary/10",
        className,
      )}
      {...rest}
    />
  );
}

export function TableHead({
  align,
  width,
  minWidth,
  maxWidth,
  style,
  className,
  ...rest
}: TableHeadProps) {
  const { density, cellAlign, headerAlign } = useContext(TableSkinContext);
  // 表头对齐（#292）：按格 `align` 优先，缺省落表级 `headerAlign`，再落表级 `cellAlign`，都不写为左。
  const ha = align ?? headerAlign ?? cellAlign ?? "left";
  return (
    <th
      style={widthStyle({ width, minWidth, maxWidth }, style)}
      className={cn(
        TABLE_DENSITY_PAD[density],
        ALIGN_TEXT[ha],
        // 表头恒不换行：auto 布局下中文表头会被挤成一列一个字，列宽反而更窄（同高层 Table）
        "whitespace-nowrap font-semibold",
        className,
      )}
      {...rest}
    />
  );
}

export function TableCell({
  align,
  verticalAlign = "middle",
  whitespace,
  width,
  minWidth,
  maxWidth,
  style,
  className,
  ...rest
}: TableCellProps) {
  const { density, cellWhitespace, cellAlign } = useContext(TableSkinContext);
  const ws = whitespace ?? cellWhitespace;
  // 水平对齐（#292）：按格 `align` 优先，缺省落表级 `cellAlign`，都不写为左。
  const ca = align ?? cellAlign ?? "left";
  return (
    <td
      style={widthStyle({ width, minWidth, maxWidth }, style)}
      className={cn(
        TABLE_DENSITY_PAD[density],
        ALIGN_TEXT[ca],
        VALIGN_CLASS[verticalAlign],
        ws && TABLE_WHITESPACE_CLASS[ws],
        className,
      )}
      {...rest}
    />
  );
}
