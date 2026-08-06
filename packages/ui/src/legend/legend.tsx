import { memo } from "react";
import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import { chartColor } from "../chart/chart-theme";
import { pressableClass } from "../motion";
import type { LegendMarker, LegendProps } from "./legend.types";

// Legend = 独立图例：彩色标记 + 系列名（+ 可选数值），可点切换系列显隐。
//
// 为什么单独成件：recharts 的 <Legend> 只能长在 recharts 图里，而库里大量图形是自绘的
// —— Sparkline / Heatmap / ContributionGraph / WorldMap / Funnel / 卡片右上角的两行小图例，
// 这些场景此前只能在业务侧手搓「一个圆点 + 一段文字」，颜色也各写各的。
// 这里统一：缺省色按序取 chart-1..6（与 Chart 同一套 token），标记形状对齐图形语言。
// 纯展示零 hook（可 RSC）；显隐是**受控**的——组件不自管状态，`hidden` 由调用方给。

const markerSize: Record<"sm" | "md", string> = { sm: "size-2", md: "size-2.5" };
const textSize: Record<"sm" | "md", string> = { sm: "text-[11px]", md: "text-xs" };

function markerClass(marker: LegendMarker, size: "sm" | "md"): string {
  if (marker === "line") return cn("h-0.5 rounded-full", size === "sm" ? "w-3" : "w-3.5");
  return cn(markerSize[size], marker === "dot" ? "rounded-full" : "rounded-[2px]");
}

function LegendImpl({
  items,
  marker = "dot",
  layout = "row",
  size = "md",
  onItemClick,
  className,
  ...rest
}: LegendProps) {
  return (
    <ul
      className={cn(
        "flex min-w-0 list-none",
        layout === "column" ? "flex-col gap-1" : "flex-wrap items-center gap-x-3 gap-y-1",
        textSize[size],
        className,
      )}
      {...rest}
    >
      {items.map((item, i) => {
        const color = resolveTone(item.color) ?? chartColor(i);
        const inner = (
          <>
            <span
              className={cn("shrink-0", markerClass(marker, size))}
              style={{ backgroundColor: color }}
              aria-hidden
            />
            <span className="truncate">{item.label}</span>
            {item.value != null && (
              <span className="ml-auto shrink-0 font-medium tabular-nums text-foreground">
                {item.value}
              </span>
            )}
          </>
        );
        // hidden 只压视觉不删条目——图例得留着才能点回来。
        const rowClass = cn(
          "inline-flex min-w-0 items-center gap-1.5 text-muted",
          item.hidden && "opacity-45",
          layout === "column" && "w-full",
        );
        return (
          <li key={item.id ?? i} className={cn("min-w-0", layout === "column" && "w-full")}>
            {onItemClick ? (
              <button
                type="button"
                onClick={() => onItemClick(item, i)}
                aria-pressed={!item.hidden}
                className={cn(
                  rowClass,
                  "cursor-pointer rounded-[calc(var(--radius)-0.375rem)] outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                  pressableClass,
                )}
              >
                {inner}
              </button>
            ) : (
              <span className={rowClass}>{inner}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

LegendImpl.displayName = "Legend";

// #89：父级稳定更新时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const Legend = memo(LegendImpl);
Legend.displayName = "Legend";
