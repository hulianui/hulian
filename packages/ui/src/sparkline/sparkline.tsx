import { cn } from "../lib/cn";
import {
  areaPath,
  barRects,
  linePath,
  normalize,
} from "./sparkline-geometry";
import type { SparklineProps } from "./sparkline.types";

/**
 * Sparkline 内联趋势迷你图：无轴无网格的极简 SVG 趋势，区别于重量级 Chart（recharts）。
 * 纯 SVG 零依赖，token 驱动配色（默认 var(--primary)）。
 * 整体 RSC 安全——renderTooltip 走原生 <title>（零 JS），无需 "use client"。
 */
export function Sparkline({
  data,
  variant = "line",
  width = 80,
  height = 24,
  tone = "var(--primary)",
  highlightLast = false,
  min,
  max,
  renderTooltip,
  className,
  ...props
}: SparklineProps) {
  const scale = { w: width, h: height, min, max };
  // strokeWidth 内缩：避免描边/圆点在视口边缘被裁切。
  const pad = 2;
  const innerScale = {
    w: width - pad * 2,
    h: height - pad * 2,
    min,
    max,
  };
  const pts = normalize(data, innerScale);
  const values = data.map((d) => (typeof d === "number" ? d : d.y));
  const last = pts[pts.length - 1];

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
        {variant === "area" ? (
          <>
            <path
              d={areaPath(data, innerScale)}
              fill={tone}
              fillOpacity={0.16}
              stroke="none"
            />
            <path
              d={linePath(data, innerScale)}
              fill="none"
              stroke={tone}
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
            stroke={tone}
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
                fill={tone}
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
          <circle cx={last.x} cy={last.y} r={2} fill={tone} stroke="var(--surface)" strokeWidth={1} />
        ) : null}
      </g>
    </svg>
  );
}
