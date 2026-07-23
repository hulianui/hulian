"use client";
import { cn } from "../lib/cn";
import { buildMatrix, bucketize } from "./heatmap.matrix";
import type { HeatmapCellInfo, HeatmapProps } from "./heatmap.types";

// 热力图：网格色阶映射(value→bucket→primary 透明度档) + 行列标签 + 原生 hover 提示 + 点击下钻。
// 库内首个热力图，通用价值高（代码热点 / 贡献活动 / 覆盖率）。纯函数 buildMatrix/bucketize 可测，零依赖。
function bucketBackground(bucket: number, scale: number): string {
  if (bucket === 0) return "var(--color-surface-hover)";
  const alpha = 0.18 + (bucket / scale) * 0.82;
  return `color-mix(in oklch, var(--color-primary) ${Math.round(alpha * 100)}%, transparent)`;
}

export function Heatmap({
  data,
  xLabels,
  yLabels,
  colorScale = 5,
  max,
  domain,
  valueFormat,
  unit,
  showLegend = false,
  cellSize = 14,
  gap = 3,
  showLabels = true,
  formatTooltip,
  onCellClick,
  className,
}: HeatmapProps) {
  const { xs, ys, get } = buildMatrix(data, xLabels, yLabels);
  // 值域：domain 显式最优先；否则 [0, max ?? 数据最大]。数据最大 <1（小数/比率）不再抬到 1，
  // 保持小数据也能铺满色阶；全 0/空数据回落 1 防除零。
  const [domainMin, domainMax] = domain ?? [0, max ?? (Math.max(0, ...data.map((d) => d.value)) || 1)];
  const formatValue = valueFormat ?? (unit != null ? (v: number) => `${v}${unit}` : (v: number) => String(v));

  return (
    <div className={cn("inline-block overflow-x-auto", className)}>
      <div
        className="inline-grid"
        style={{
          gridTemplateColumns: `${showLabels ? "auto " : ""}repeat(${xs.length}, ${cellSize}px)`,
          gap,
        }}
      >
        {ys.map((y) => (
          <div key={`row-${y}`} className="contents">
            {showLabels && (
              <span className="self-center pr-2 text-right text-[10px] leading-none text-muted">
                {y}
              </span>
            )}
            {xs.map((x) => {
              const value = get(y, x);
              const bucket = bucketize(value, domainMax, colorScale, domainMin);
              const info: HeatmapCellInfo = { x, y, value };
              const title = formatTooltip ? formatTooltip(info) : `${y} · ${x}：${formatValue(value)}`;
              const style = {
                width: cellSize,
                height: cellSize,
                background: bucketBackground(bucket, colorScale),
              };
              return onCellClick ? (
                <button
                  type="button"
                  key={`${y}-${x}`}
                  title={title}
                  aria-label={title}
                  onClick={() => onCellClick(info)}
                  className="rounded-[2px] outline-none ring-primary transition-transform hover:scale-110 focus-visible:ring-2"
                  style={style}
                />
              ) : (
                <span
                  key={`${y}-${x}`}
                  title={title}
                  aria-label={title}
                  className="rounded-[2px]"
                  style={style}
                />
              );
            })}
          </div>
        ))}
        {showLabels && (
          <div className="contents">
            <span />
            {xs.map((x) => (
              <span key={`xl-${x}`} className="pt-1 text-center text-[10px] leading-none text-muted">
                {x}
              </span>
            ))}
          </div>
        )}
      </div>
      {showLegend && (
        <div
          className="mt-2 flex items-center gap-1 text-[10px] leading-none text-muted"
          aria-label={`色阶：${formatValue(domainMin)} 至 ${formatValue(domainMax)}`}
        >
          <span className="pr-1">{formatValue(domainMin)}</span>
          {Array.from({ length: colorScale + 1 }, (_, bucket) => (
            <span
              key={bucket}
              className="rounded-[2px]"
              style={{
                width: Math.min(cellSize, 12),
                height: Math.min(cellSize, 12),
                background: bucketBackground(bucket, colorScale),
              }}
            />
          ))}
          <span className="pl-1">{formatValue(domainMax)}</span>
        </div>
      )}
    </div>
  );
}
