import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import {
  areaPath,
  barRects,
  linePath,
  normalize,
  valueToY,
} from "./sparkline-geometry";
import type { SparklineProps } from "./sparkline.types";

/**
 * Sparkline 内联趋势迷你图：无轴无网格的极简 SVG 趋势，区别于重量级 Chart（recharts）。
 * 纯 SVG 零依赖，token 驱动配色（默认 var(--color-primary)）。
 * 整体 RSC 安全——renderTooltip 走原生 <title>（零 JS），无需 "use client"。
 */
export function Sparkline({
  data,
  variant = "line",
  width = 80,
  height = 24,
  tone = "var(--color-primary)",
  highlightLast = false,
  min,
  max,
  baseline,
  baselineTone = "var(--color-muted)",
  baselineLabel,
  renderTooltip,
  className,
  ...props
}: SparklineProps) {
  // strokeWidth 内缩：避免描边/圆点在视口边缘被裁切。
  const pad = 2;
  const values = data.map((d) => (typeof d === "number" ? d : d.y));
  // 基准线要可见就必须进归一化域：否则一个高于全部数据的目标值会被画到视口外。
  // 只在调用方没显式框定 min/max 时才这么扩——显式给了就尊重它。
  const hasBaseline = baseline != null && Number.isFinite(baseline);
  const effMin =
    min ?? (hasBaseline && values.length ? Math.min(...values, baseline) : min);
  const effMax =
    max ?? (hasBaseline && values.length ? Math.max(...values, baseline) : max);
  const innerScale = {
    w: width - pad * 2,
    h: height - pad * 2,
    min: effMin,
    max: effMax,
  };
  const pts = normalize(data, innerScale);
  const last = pts[pts.length - 1];
  // 归一颜色：吃语义色名 / 容错漏前缀的 var(--primary) → var(--color-primary)
  const color = resolveTone(tone);
  const baseColor = resolveTone(baselineTone);
  const baseY = hasBaseline ? valueToY(baseline, data, innerScale) : null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-hidden={renderTooltip ? undefined : true}
      className={cn("inline-block overflow-visible align-middle", className)}
      {...props}
    >
      <g transform={`translate(${pad},${pad})`}>
        {/* 基准线画在序列之下：它是背景参照，不该盖住数据本身 */}
        {baseY != null ? (
          <line
            x1={0}
            y1={baseY}
            x2={innerScale.w}
            y2={baseY}
            stroke={baseColor}
            strokeWidth={1}
            strokeDasharray="3 2"
            strokeOpacity={0.7}
          >
            {baselineLabel ? <title>{baselineLabel}</title> : null}
          </line>
        ) : null}

        {variant === "area" ? (
          <>
            <path
              d={areaPath(data, innerScale)}
              fill={color}
              fillOpacity={0.16}
              stroke="none"
            />
            <path
              d={linePath(data, innerScale)}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        ) : null}

        {variant === "line" ? (
          <path
            d={linePath(data, innerScale)}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}

        {variant === "bar"
          ? barRects(data, innerScale).map((r, i) => (
              <rect
                key={i}
                x={r.x}
                y={r.y}
                width={r.width}
                height={r.height}
                rx={Math.min(1, r.width / 4)}
                fill={color}
                fillOpacity={0.85}
              >
                {renderTooltip ? <title>{renderTooltip(values[i], i)}</title> : null}
              </rect>
            ))
          : null}

        {/* line/area 下用透明点承接逐点 tooltip（不可见，仅命中区） */}
        {variant !== "bar" && renderTooltip
          ? pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={4} fill="transparent">
                <title>{renderTooltip(values[i], i)}</title>
              </circle>
            ))
          : null}

        {highlightLast && last ? (
          <circle cx={last.x} cy={last.y} r={2} fill={color} stroke="var(--color-surface)" strokeWidth={1} />
        ) : null}
      </g>
    </svg>
  );
}
