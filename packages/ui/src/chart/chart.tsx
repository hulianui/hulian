"use client";
import {
  ResponsiveContainer,
  AreaChart as ReAreaChart,
  BarChart as ReBarChart,
  LineChart as ReLineChart,
  PieChart as RePieChart,
  RadarChart as ReRadarChart,
  RadialBarChart as ReRadialBarChart,
  Area,
  Bar,
  Line,
  Pie,
  Cell,
  Radar,
  RadialBar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  useChartWidth,
} from "recharts";
import { Dot } from "../dot/dot";
import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import {
  chartColor,
  axisProps,
  gridProps,
  tooltipContentStyle,
  tooltipLabelStyle,
  polarAngleTick,
  legendStyle,
} from "./chart-theme";
import type { ChartProps, BarChartProps, ChartSeries, PieChartProps, RadialChartProps } from "./chart.types";

const MARGIN = { top: 8, right: 8, bottom: 0, left: -8 };

// 序列图例：色点 + series.label。刻意不走 recharts <Legend>——它的色点是方块、间距与
// 字号另有一套，且会参与 recharts 自己的高度分配；这里用 Dot + token 排一行，与库内其它
// 图例（Sankey/Funnel 等）长一个样，色点颜色与序列色同源（同一个 resolveTone 路径）。
const LEGEND_ROW_H = 24;

function ChartLegend({ series }: { series: ChartSeries[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted">
      {series.map((s, i) => (
        <span key={s.key} className="inline-flex items-center gap-1.5">
          <Dot size="sm" color={resolveTone(s.color) ?? chartColor(i)} />
          {s.label ?? s.key}
        </span>
      ))}
    </div>
  );
}

/**
 * 图表外壳：统一「总高 = 图例行 + 画布」的分配。
 * height 语义保持不变（组件总高），开图例时画布相应变矮，而不是把总高撑高。
 * 画布高度仍是显式数值（不是 "100%"），首帧 ResponsiveContainer 才不会告警。
 */
function ChartFrame({
  height,
  className,
  legend,
  series,
  children,
}: {
  height: number;
  className?: string;
  legend?: boolean | "top" | "bottom";
  series: ChartSeries[];
  children: (canvasHeight: number) => React.ReactNode;
}) {
  const place = legend === true ? "bottom" : legend || null;
  const canvasHeight = place ? Math.max(1, height - LEGEND_ROW_H) : height;
  return (
    <div className={cn("flex w-full flex-col", className)} style={{ height }}>
      {place === "top" && <ChartLegend series={series} />}
      <div className="w-full" style={{ height: canvasHeight }}>
        {children(canvasHeight)}
      </div>
      {place === "bottom" && <ChartLegend series={series} />}
    </div>
  );
}

// ResponsiveContainer 首帧用 initialDimension {-1,-1} 渲染，宽高全 -1 会触发
// "width(-1) and height(-1) should be greater than 0" 的 dev warning。
// 我们的高度始终是显式数值（height prop），把它直接交给 ResponsiveContainer
//（而非 "100%"），首帧 calculatedHeight > 0 即不再告警，行为不变（宽仍等实测）。
//
// 雷达图角轴长 CJK 标签在窄容器（H5 375px）会越出 SVG 左右边被裁。
// PolarAngleWrapTick 按「锚点方向上的剩余空间」检测溢出，溢出时把标签均分折两行。
const POLAR_TICK_FONT = 12;

interface PolarAngleWrapTickProps {
  x?: number;
  y?: number;
  textAnchor?: "start" | "middle" | "end";
  verticalAnchor?: "start" | "middle" | "end";
  payload?: { value?: unknown };
}

// 首行 dy：单行尽量贴近 recharts 默认 Text 的垂直锚点；两行时整体向锚点反方向让位
function firstLineDy(verticalAnchor: string, twoLine: boolean): number {
  if (verticalAnchor === "start") return 11; // 图下方标签：向下排
  if (verticalAnchor === "end") return twoLine ? -15 : -2; // 图上方标签：向上让位
  return twoLine ? -2 : 4; // 两侧标签：绕 y 居中
}

function PolarAngleWrapTick({
  x = 0,
  y = 0,
  textAnchor = "middle",
  verticalAnchor = "middle",
  payload,
}: PolarAngleWrapTickProps) {
  // useChartWidth 在图表上下文缺失时可能返回 undefined → 视为不限宽（不折行）
  const chartWidth = useChartWidth() ?? Number.POSITIVE_INFINITY;
  const value = String(payload?.value ?? "");
  // CJK 全角字符宽 ≈ fontSize；按锚点方向估算可用横向空间
  const textWidth = value.length * POLAR_TICK_FONT;
  const available =
    textAnchor === "end"
      ? x
      : textAnchor === "start"
        ? chartWidth - x
        : Math.min(x, chartWidth - x) * 2;
  const half = Math.ceil(value.length / 2);
  const lines =
    value.length > 3 && textWidth > available - 4
      ? [value.slice(0, half), value.slice(half)]
      : [value];
  return (
    <text x={x} y={y} textAnchor={textAnchor} fill="var(--color-muted)" fontSize={POLAR_TICK_FONT}>
      {lines.map((line, i) => (
        <tspan key={line} x={x} dy={i === 0 ? firstLineDy(verticalAnchor, lines.length === 2) : 13}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

// horizontal 柱图的类目轴（YAxis）宽度：recharts 需要显式 px，写死会截断 CJK 标签
// （48px 只容 ~3 个全角字）。按最长标签估宽：CJK/全角 ≈ fontSize，半角 ≈ 0.62×fontSize，
// 另加 tick 与轴的间隙。夹在 [48, 160]——超长标签建议消费侧截短或显式传 yAxisWidth。
const AXIS_TICK_FONT = 12; // 与 chart-theme axisProps.tick.fontSize 同源
export function categoryAxisWidth(labels: unknown[], override?: number): number {
  if (override != null) return override;
  let longest = 0;
  for (const label of labels) {
    let w = 0;
    for (const ch of String(label ?? "")) {
      w += (ch.codePointAt(0) ?? 0) > 0xff ? AXIS_TICK_FONT : AXIS_TICK_FONT * 0.62;
    }
    if (w > longest) longest = w;
  }
  return Math.min(160, Math.max(48, Math.ceil(longest) + 16));
}

// recharts 引擎（坐标系/比例尺/路径）+ 瑚琏皮肤（SVG 色走 var(--color-chart-N)/token，明暗自适应）。
export function AreaChart<TDatum>({
  data,
  series,
  xKey,
  height = 280,
  className,
  stacked,
  legend,
}: ChartProps<TDatum>) {
  return (
    <ChartFrame height={height} className={className} legend={legend} series={series}>
      {(canvasHeight) => (
      <ResponsiveContainer width="100%" height={canvasHeight} minWidth={0} minHeight={0}>
        <ReAreaChart data={data} margin={MARGIN}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
          {series.map((s, i) => {
            const color = resolveTone(s.color) ?? chartColor(i);
            return (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label ?? s.key}
                stackId={stacked ? "a" : undefined}
                stroke={color}
                fill={color}
                fillOpacity={stacked ? 0.4 : 0.15}
                strokeWidth={2}
              />
            );
          })}
        </ReAreaChart>
      </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

export function BarChart<TDatum>({
  data,
  series,
  xKey,
  height = 280,
  className,
  stacked,
  horizontal,
  yAxisWidth,
  legend,
}: BarChartProps<TDatum>) {
  return (
    <ChartFrame height={height} className={className} legend={legend} series={series}>
      {(canvasHeight) => (
      <ResponsiveContainer width="100%" height={canvasHeight} minWidth={0} minHeight={0}>
        <ReBarChart
          data={data}
          margin={MARGIN}
          layout={horizontal ? "vertical" : "horizontal"}
        >
          <CartesianGrid {...gridProps} vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" {...axisProps} />
              <YAxis
                type="category"
                dataKey={xKey}
                {...axisProps}
                width={categoryAxisWidth(
                  data.map((d) => (d as Record<string, unknown>)[xKey]),
                  yAxisWidth,
                )}
              />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} {...axisProps} />
              <YAxis {...axisProps} />
            </>
          )}
          <Tooltip
            contentStyle={tooltipContentStyle}
            labelStyle={tooltipLabelStyle}
            cursor={{ fill: "var(--color-surface-hover)" }}
          />
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label ?? s.key}
              stackId={stacked ? "a" : undefined}
              fill={resolveTone(s.color) ?? chartColor(i)}
              radius={
                horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
              }
            />
          ))}
        </ReBarChart>
      </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

export function LineChart<TDatum>({
  data,
  series,
  xKey,
  height = 280,
  className,
  legend,
}: ChartProps<TDatum>) {
  return (
    <ChartFrame height={height} className={className} legend={legend} series={series}>
      {(canvasHeight) => (
      <ResponsiveContainer width="100%" height={canvasHeight} minWidth={0} minHeight={0}>
        <ReLineChart data={data} margin={MARGIN}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
          {series.map((s, i) => {
            const color = resolveTone(s.color) ?? chartColor(i);
            return (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label ?? s.key}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            );
          })}
        </ReLineChart>
      </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

// 饼图 / 环形图：扁平 {name,value} 数据，每片走 chart token。
export function PieChart({ data, donut, height = 280, className }: PieChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height={height} minWidth={0} minHeight={0}>
        <RePieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={donut ? "55%" : 0}
            outerRadius="80%"
            paddingAngle={donut ? 2 : 0}
            stroke="var(--color-surface)"
            strokeWidth={2}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={resolveTone(d.color) ?? chartColor(i)} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
          <Legend wrapperStyle={legendStyle} />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 雷达图：series + xKey（角轴维度），多序列叠加。
export function RadarChart<TDatum>({
  data,
  series,
  xKey,
  height = 280,
  className,
}: ChartProps<TDatum>) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height={height} minWidth={0} minHeight={0}>
        <ReRadarChart data={data} margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis dataKey={xKey} tick={<PolarAngleWrapTick />} />
          <PolarRadiusAxis tick={polarAngleTick} axisLine={false} />
          {series.map((s, i) => {
            const color = resolveTone(s.color) ?? chartColor(i);
            return (
              <Radar
                key={s.key}
                dataKey={s.key}
                name={s.label ?? s.key}
                stroke={color}
                fill={color}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            );
          })}
          <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
          <Legend wrapperStyle={legendStyle} />
        </ReRadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 径向条形图：扁平 {name,value} 当多环进度/仪表。
export function RadialChart({ data, height = 280, className }: RadialChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height={height} minWidth={0} minHeight={0}>
        <ReRadialBarChart
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="25%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar dataKey="value" background cornerRadius={6}>
            {data.map((d, i) => (
              <Cell key={d.name} fill={resolveTone(d.color) ?? chartColor(i)} />
            ))}
          </RadialBar>
          <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
          <Legend wrapperStyle={legendStyle} />
        </ReRadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
