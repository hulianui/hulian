"use client";

import { memo } from "react";
import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import { bucketize } from "../heatmap/heatmap.matrix";
import { buildContributionCalendar, type ContributionCell } from "./contribution-matrix";
import type { ContributionGraphProps } from "./contribution-graph.types";

// ContributionGraph = 贡献活动墙：日期驱动的格子图（GitHub 那面绿墙 / 卡片右侧的 30 天活动条）。
//
// 和 Heatmap 的分工：Heatmap 是通用矩阵（任意行列 + 标签由数据推导），
// 本组件专吃**日期**——补齐区间内每一天、按周分列、月份标签落列、周起始可切。
// 分档复用 Heatmap 的 bucketize（同一套色阶口径，不另起 SSOT），日期算术在
// contribution-matrix 里是纯函数可单测。内置文案跟随 ConfigProvider locale。

/** 档位 → 背景色。0 档（无贡献）走中性底，其余按档位提高同色不透明度。 */
function levelBackground(level: number, levels: number, tone: string): string {
  if (level <= 0) return "var(--color-surface-hover)";
  const alpha = 0.18 + (level / levels) * 0.82;
  return `color-mix(in oklch, ${tone} ${Math.round(alpha * 100)}%, transparent)`;
}

function ContributionGraphImpl({
  data,
  days = 365,
  endDate,
  weekStart = 0,
  layout = "calendar",
  levels = 4,
  max,
  tone = "primary",
  cellSize = 11,
  gap = 3,
  showMonthLabels = true,
  showWeekdayLabels = false,
  showLegend = false,
  formatMonth,
  formatTooltip,
  onDayClick,
  className,
  ...rest
}: ContributionGraphProps) {
  const locale = useComponentLocale().contributionGraph ?? {
    weekdays: ["日", "一", "二", "三", "四", "五", "六"],
    month: (month) => `${month}月`,
    tooltip: (date, count, present) =>
      present || count > 0 ? `${date} · ${count} 次` : `${date} · 无贡献`,
    summary: (days, total) => `过去 ${days} 天共 ${total} 次贡献`,
    less: "少",
    more: "多",
  };
  const calendar = buildContributionCalendar(data, { days, endDate, weekStart });
  const accent = resolveTone(tone) ?? "var(--color-primary)";
  const domainMax = max ?? calendar.max;
  // 小方块上用 var(--radius) 会被磨成圆点，这里按边长取一个恒定小圆角。
  const radius = Math.max(2, Math.round(cellSize / 4));

  const monthText = formatMonth ?? ((iso: string) => locale.month(Number(iso.slice(5, 7))));
  const tipText =
    formatTooltip ??
    ((cell: ContributionCell) => locale.tooltip(cell.date, cell.count, cell.present));

  const renderCell = (cell: ContributionCell | null, key: string) => {
    if (!cell) return <span key={key} aria-hidden style={{ width: cellSize, height: cellSize }} />;
    const level = bucketize(cell.count, domainMax, levels);
    const style = {
      width: cellSize,
      height: cellSize,
      borderRadius: radius,
      backgroundColor: levelBackground(level, levels, accent),
    };
    const title = tipText(cell);
    return onDayClick ? (
      <button
        key={key}
        type="button"
        title={title}
        aria-label={title}
        onClick={() => onDayClick(cell)}
        className="cursor-pointer outline-none transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-bg"
        style={style}
      />
    ) : (
      <span key={key} title={title} style={style} />
    );
  };

  // 无点击时整块当一张图对读屏播报总数，避免 365 个格子被逐个念。
  const a11y = onDayClick
    ? {}
    : { role: "img", "aria-label": locale.summary(calendar.days.length, calendar.total) };

  const legend = showLegend && (
    <div className="flex items-center gap-1 text-[10px] leading-none text-muted-foreground">
      <span>{locale.less}</span>
      {Array.from({ length: levels + 1 }, (_, i) => (
        <span
          key={i}
          style={{
            width: cellSize,
            height: cellSize,
            borderRadius: radius,
            backgroundColor: levelBackground(i, levels, accent),
          }}
        />
      ))}
      <span>{locale.more}</span>
    </div>
  );

  if (layout === "strip") {
    return (
      <div className={cn("inline-flex flex-col items-end gap-1.5", className)} {...a11y} {...rest}>
        <div className="flex items-center" style={{ gap }}>
          {calendar.days.map((cell) => renderCell(cell, cell.date))}
        </div>
        {legend}
      </div>
    );
  }

  const weekdayOrder = Array.from({ length: 7 }, (_, i) => (i + weekStart) % 7);

  return (
    // max-w-full + 内层 min-w-0：整面墙（53 周 ≈ 740px）放进窄卡片时在**内部**横向滚动，
    // 而不是把卡片撑破。少了 min-w-0，flex 子项按 min-content 撑开，overflow-x-auto 永远不触发。
    <div className={cn("inline-flex max-w-full flex-col gap-1.5", className)} {...a11y} {...rest}>
      <div className="flex max-w-full" style={{ gap }}>
        {showWeekdayLabels && (
          <div
            className="grid text-[10px] leading-none text-muted-foreground"
            style={{
              gridTemplateRows: `repeat(7, ${cellSize}px)`,
              gap,
              marginTop: showMonthLabels ? cellSize + gap : 0,
            }}
          >
            {weekdayOrder.map((wd, row) => (
              // 照 GitHub 惯例只标奇数行，格子小于文字高度时全标会糊成一片。
              <span key={wd} className="flex items-center pr-1">
                {row % 2 === 1 ? locale.weekdays[wd] : ""}
              </span>
            ))}
          </div>
        )}
        <div className="min-w-0 overflow-x-auto">
          {showMonthLabels && (
            <div
              className="grid text-[10px] leading-none text-muted-foreground"
              style={{
                gridTemplateColumns: `repeat(${calendar.weeks.length}, ${cellSize}px)`,
                gap,
                marginBottom: gap,
                height: cellSize,
              }}
            >
              {calendar.monthLabels.map((m) => (
                <span
                  key={m.date}
                  className="whitespace-nowrap"
                  style={{ gridColumnStart: m.weekIndex + 1, gridColumnEnd: "span 4" }}
                >
                  {monthText(m.date)}
                </span>
              ))}
            </div>
          )}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${calendar.weeks.length}, ${cellSize}px)`,
              gridTemplateRows: `repeat(7, ${cellSize}px)`,
              gridAutoFlow: "column",
              gap,
            }}
          >
            {calendar.weeks.map((week, w) =>
              week.map((cell, d) => renderCell(cell, cell ? cell.date : `pad-${w}-${d}`)),
            )}
          </div>
        </div>
      </div>
      {legend && <div className="flex justify-end">{legend}</div>}
    </div>
  );
}

export const ContributionGraph = memo(ContributionGraphImpl);
ContributionGraph.displayName = "ContributionGraph";
