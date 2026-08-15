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
  ComposedChart as ReComposedChart,
  ReferenceLine,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  useChartWidth,
} from "recharts";
import { Dot } from "../dot/dot";
import { cn } from "../lib/cn";
import { resolveTone } from "../lib/tone";
import { warnOnce } from "../lib/warn-once";
import { RADAR_RAW, normalizeRadarData } from "./chart-radar-axis";
import {
  chartColor,
  axisProps,
  gridProps,
  tooltipContentStyle,
  tooltipLabelStyle,
  polarAngleTick,
} from "./chart-theme";
import type { ReactNode } from "react";
import type {
  CartesianChartProps,
  BarChartProps,
  ComposedChartProps,
  RadarChartProps,
  ChartPointClickInfo,
  ChartReferenceLine,
  ChartSeries,
  ChartDatum,
  PieChartProps,
  RadialChartProps,
} from "./chart.types";

const MARGIN = { top: 8, right: 8, bottom: 0, left: -8 };

// 序列图例：色点 + series.label。刻意不走 recharts <Legend>——它的色点是方块、间距与
// 字号另有一套，且会参与 recharts 自己的高度分配；这里用 Dot + token 排一行，与库内其它
// 图例（Sankey/Funnel 等）长一个样，色点颜色与序列色同源（同一个 resolveTone 路径）。
const LEGEND_ROW_H = 24;
// 横滚档多让 8px 给常显细滚动条（同 Gantt 的横滚写法），不然滚动条会压在图例文字上。
const LEGEND_SCROLL_ROW_H = 32;

function ChartLegend({ series, scroll }: { series: ChartSeries[]; scroll?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-x-4 gap-y-1 text-xs text-muted-foreground",
        scroll
          ? [
              // 恒单行：不换行、超出横向滚动。序列多到几十条时唯一不吃画布的形态。
              "shrink-0 flex-nowrap justify-start overflow-x-auto overscroll-x-contain whitespace-nowrap",
              // 常显细滚动条，给「可横滑」明确的视觉与抓手（同 Gantt）
              "[scrollbar-width:thin] [scrollbar-color:var(--color-muted-foreground)_transparent]",
              "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/50",
              "hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/80",
            ]
          : "flex-wrap justify-center",
      )}
    >
      {series.map((s, i) => (
        <span
          key={s.key}
          // flex-nowrap 容器里的项默认可压缩，不钉 shrink-0 就会被挤成一团而不是滚动
          className={cn("inline-flex items-center gap-1.5", scroll && "shrink-0")}
        >
          <Dot size="sm" color={resolveTone(s.color) ?? chartColor(i)} />
          {s.label ?? s.key}
        </span>
      ))}
    </div>
  );
}

/** 扁平数据点（Pie/Radial）→ 图例条目：色与 `<Cell>` 走同一条解析路径（index → chart-N）。 */
function datumSeries(data: ChartDatum[]): ChartSeries[] {
  return data.map((d) => ({ key: d.name, label: d.name, color: d.color }));
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
  legendScroll,
  series,
  children,
}: {
  height: number;
  className?: string;
  legend?: boolean | "top" | "bottom";
  legendScroll?: boolean;
  series: ChartSeries[];
  children: (canvasHeight: number) => React.ReactNode;
}) {
  const place = legend === true ? "bottom" : legend || null;
  const rowH = legendScroll ? LEGEND_SCROLL_ROW_H : LEGEND_ROW_H;
  const canvasHeight = place ? Math.max(1, height - rowH) : height;
  const row = <ChartLegend series={series} scroll={legendScroll} />;
  return (
    <div className={cn("flex w-full flex-col", className)} style={{ height }}>
      {place === "top" && row}
      <div className="w-full" style={{ height: canvasHeight }}>
        {children(canvasHeight)}
      </div>
      {place === "bottom" && row}
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
    <text x={x} y={y} textAnchor={textAnchor} fill="var(--color-muted-foreground)" fontSize={POLAR_TICK_FONT}>
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

// 数据点点击（#275）。判据取 recharts 的「当前活跃类目」，与 tooltip 同源 ——
// 也就是说只要 tooltip 亮了点下去就一定有回调，不必精确点中 2px 的折线。
// 反过来，点在画布空白或坐标轴上时 activeTooltipIndex 是 undefined，此时**不回调** ——
// 回一个「点了但不知道点了什么」的事件，只会让消费方在钻取里写防御式判空。
//
// seriesKey 用 recharts 的 activeDataKey：笛卡尔图默认是整根类目轴共享 tooltip，
// 那时它是 undefined（类型上也标了「不保证有值」）；Pie/Radial 走各自的扇区级 onClick，
// 精确得多，不经过这里。
function cartesianPointClickHandler<TDatum>(
  data: TDatum[],
  onPointClick?: (info: ChartPointClickInfo<TDatum>) => void,
) {
  if (!onPointClick) return undefined;
  return (state: { activeTooltipIndex?: unknown; activeDataKey?: unknown }) => {
    // recharts 3.x 的 activeTooltipIndex 是字符串（TooltipIndex = string | null，
    // combineActiveTooltipIndex 两个出口都 String(...)），`typeof !== "number"` 会把
    // 笛卡尔图的点击**全部**拦掉且不报错（#281）。数值化后再收窄：
    // null / ""（Number 化都是 0，会误点第 0 条）与 Sankey/Treemap 的 "children[0]"
    // （NaN）都进不来，只放行真正的整数下标。
    const raw = state.activeTooltipIndex;
    const index =
      typeof raw === "number" ? raw : typeof raw === "string" && raw !== "" ? Number(raw) : NaN;
    if (!Number.isInteger(index) || index < 0) return;
    const datum = data[index];
    if (datum === undefined) return;
    const seriesKey = typeof state.activeDataKey === "string" ? state.activeDataKey : undefined;
    onPointClick({ datum, index, seriesKey });
  };
}

// 逐轴归一后的 tooltip：显示随行带走的原始值（RADAR_RAW），而不是画在图上的 0–100。
// 取不到原始值时回落到归一值 —— 宁可显示一个数，也不要显示空白。
function radarRawFormatter(
  value: ReactNode,
  name: ReactNode,
  item: { dataKey?: unknown; payload?: Record<string, unknown> },
): [ReactNode, ReactNode] {
  const raw = item?.payload?.[RADAR_RAW] as Record<string, number> | undefined;
  const key = typeof item?.dataKey === "string" ? item.dataKey : undefined;
  const original = key != null ? raw?.[key] : undefined;
  return [original ?? value, name];
}

// 参考线（#274）：帕累托的 80/95 线、均值线、目标线。虚线 + 端部标签，色缺省取 muted-foreground
// 而不是某个 chart-N —— 它不是一条数据，抢了数据序列的色相反而会被读成「第 N 条序列」。
function renderReferenceLines(lines: ChartReferenceLine[] | undefined, dualAxis: boolean) {
  if (!lines?.length) return null;
  return lines.map((line, i) => (
    <ReferenceLine
      key={`${line.axis ?? "left"}-${line.y}-${i}`}
      y={line.y}
      // 单轴图不给 YAxis 设 id，这里也不能传 yAxisId，否则 recharts 找不到轴、整条线不画。
      yAxisId={dualAxis ? (line.axis ?? "left") : undefined}
      stroke={resolveTone(line.color) ?? "var(--color-muted-foreground)"}
      strokeDasharray={line.dash ?? "4 4"}
      strokeWidth={1}
      label={
        line.label
          ? {
              value: line.label,
              position: "insideTopRight",
              fill: "var(--color-muted-foreground)",
              fontSize: 11,
            }
          : undefined
      }
    />
  ));
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
  legendScroll,
  onPointClick,
  referenceLines,
  yAxisDomain,
}: CartesianChartProps<TDatum>) {
  const handleClick = cartesianPointClickHandler(data, onPointClick);
  return (
    <ChartFrame height={height} className={className} legend={legend} legendScroll={legendScroll} series={series}>
      {(canvasHeight) => (
      <ResponsiveContainer width="100%" height={canvasHeight} minWidth={0} minHeight={0}>
        <ReAreaChart data={data} margin={MARGIN} onClick={handleClick}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} domain={yAxisDomain} />
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
          {renderReferenceLines(referenceLines, false)}
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
  legendScroll,
  onPointClick,
  referenceLines,
  yAxisDomain,
}: BarChartProps<TDatum>) {
  const handleClick = cartesianPointClickHandler(data, onPointClick);
  return (
    <ChartFrame height={height} className={className} legend={legend} legendScroll={legendScroll} series={series}>
      {(canvasHeight) => (
      <ResponsiveContainer width="100%" height={canvasHeight} minWidth={0} minHeight={0}>
        <ReBarChart
          data={data}
          margin={MARGIN}
          layout={horizontal ? "vertical" : "horizontal"}
          onClick={handleClick}
        >
          <CartesianGrid {...gridProps} vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              {/* horizontal 时值轴是横轴，yAxisDomain 落在这里而不是类目轴上。 */}
              <XAxis type="number" {...axisProps} domain={yAxisDomain} />
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
              <YAxis {...axisProps} domain={yAxisDomain} />
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
          {renderReferenceLines(referenceLines, false)}
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
  legendScroll,
  onPointClick,
  referenceLines,
  yAxisDomain,
}: CartesianChartProps<TDatum>) {
  const handleClick = cartesianPointClickHandler(data, onPointClick);
  return (
    <ChartFrame height={height} className={className} legend={legend} legendScroll={legendScroll} series={series}>
      {(canvasHeight) => (
      <ResponsiveContainer width="100%" height={canvasHeight} minWidth={0} minHeight={0}>
        <ReLineChart data={data} margin={MARGIN} onClick={handleClick}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} domain={yAxisDomain} />
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
          {renderReferenceLines(referenceLines, false)}
        </ReLineChart>
      </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

// 组合图（#274）：一个类目轴上同时画柱与线，各自吃一条 Y 轴。
//
// 为什么是新组件而不是给 BarChart 加 series.type：那会得到一个「渲染折线的柱状图」——
// 组件名与它画出来的东西对不上，文档也没法写。反过来，双量纲这件事本身就该有个名字，
// echarts 用 markLine + yAxisIndex 表达，recharts 用 ComposedChart，业界口径一致。
//
// 双轴恒开（左右都建 YAxis）而不是「有 axis:'right' 的序列才建右轴」：轴 id 是 recharts 的
// 硬约束 —— 序列写了 yAxisId 就必须有同 id 的轴，两边分叉会得到一张空图。恒开的代价只是
// 右侧多一条没有刻度的轴线，而 hide 掉它即可。
export function ComposedChart<TDatum>({
  data,
  series,
  xKey,
  height = 280,
  className,
  stacked,
  legend,
  legendScroll,
  onPointClick,
  referenceLines,
  leftAxisLabel,
  rightAxisLabel,
  leftAxisDomain,
  rightAxisDomain,
}: ComposedChartProps<TDatum>) {
  const handleClick = cartesianPointClickHandler(data, onPointClick);
  const hasRight = series.some((s) => s.axis === "right");
  return (
    <ChartFrame
      height={height}
      className={className}
      legend={legend}
      legendScroll={legendScroll}
      series={series}
    >
      {(canvasHeight) => (
        <ResponsiveContainer width="100%" height={canvasHeight} minWidth={0} minHeight={0}>
          <ReComposedChart
            data={data}
            // 右轴要显示刻度，左负边距那套（MARGIN.left=-8）只贴左轴，右边得留出位置。
            margin={hasRight ? { ...MARGIN, right: 8 } : MARGIN}
            onClick={handleClick}
          >
            <CartesianGrid {...gridProps} />
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis
              yAxisId="left"
              {...axisProps}
              domain={leftAxisDomain}
              label={
                leftAxisLabel
                  ? {
                      value: leftAxisLabel,
                      angle: -90,
                      position: "insideLeft",
                      fill: "var(--color-muted-foreground)",
                      fontSize: 11,
                    }
                  : undefined
              }
            />
            {/* 右轴恒建、无右序列时 hide：见组件头注释（轴 id 缺席会让写了 yAxisId 的序列整条消失）。 */}
            {/* 右轴 domain（#282）：百分比轴锁 [0,100] 满量程 —— TOP N 截断的帕累托数据
                accumulate 只到 80 多，auto domain 会把 95 参考线判越界丢弃、82% 画到顶格。 */}
            <YAxis
              yAxisId="right"
              orientation="right"
              hide={!hasRight}
              {...axisProps}
              domain={rightAxisDomain}
              label={
                rightAxisLabel
                  ? {
                      value: rightAxisLabel,
                      angle: 90,
                      position: "insideRight",
                      fill: "var(--color-muted-foreground)",
                      fontSize: 11,
                    }
                  : undefined
              }
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              cursor={{ fill: "var(--color-surface-hover)" }}
            />
            {series.map((s, i) => {
              const color = resolveTone(s.color) ?? chartColor(i);
              const axis = s.axis ?? "left";
              const name = s.label ?? s.key;
              // 堆叠只在同轴同图种的柱之间成立，故 stackId 带上轴名 —— 否则左右轴的柱会被
              // recharts 叠到一起，两个量纲相加是没有意义的数。
              if (s.type === "line") {
                return (
                  <Line
                    key={s.key}
                    yAxisId={axis}
                    type="monotone"
                    dataKey={s.key}
                    name={name}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                );
              }
              if (s.type === "area") {
                return (
                  <Area
                    key={s.key}
                    yAxisId={axis}
                    type="monotone"
                    dataKey={s.key}
                    name={name}
                    stackId={stacked ? `a-${axis}` : undefined}
                    stroke={color}
                    fill={color}
                    fillOpacity={stacked ? 0.4 : 0.15}
                    strokeWidth={2}
                  />
                );
              }
              return (
                <Bar
                  key={s.key}
                  yAxisId={axis}
                  dataKey={s.key}
                  name={name}
                  stackId={stacked ? `a-${axis}` : undefined}
                  fill={color}
                  radius={[4, 4, 0, 0]}
                />
              );
            })}
            {renderReferenceLines(referenceLines, true)}
          </ReComposedChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

// 饼图 / 环形图：扁平 {name,value} 数据，每片走 chart token。
// 图例走 ChartFrame（与笛卡尔三件同一套 legend/legendScroll 语义），不是 recharts <Legend>——
// 后者写死在图内，消费方既关不掉也挪不动，自绘就变成两份图例并排（hulianui/hulian#80）。
export function PieChart({
  data,
  donut,
  height = 280,
  className,
  legend = true,
  legendScroll,
  onPointClick,
}: PieChartProps) {
  return (
    <ChartFrame
      height={height}
      className={className}
      legend={legend}
      legendScroll={legendScroll}
      series={datumSeries(data)}
    >
      {(canvasHeight) => (
      <ResponsiveContainer width="100%" height={canvasHeight} minWidth={0} minHeight={0}>
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
            // 扇区级 onClick（#275）：比图表根的活跃类目精确 —— 一片就是一个数据点，
            // 且点在留白处不会误触发。index 直接对应 data 的下标。
            onClick={onPointClick ? (_, index) => onPointClick({ datum: data[index]!, index }) : undefined}
            className={onPointClick ? "cursor-pointer" : undefined}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={resolveTone(d.color) ?? chartColor(i)} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
        </RePieChart>
      </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

// 雷达图：series + xKey（角轴维度），多序列叠加。图例同 PieChart 走 ChartFrame。
export function RadarChart<TDatum>({
  data,
  series,
  xKey,
  height = 280,
  className,
  legend = true,
  legendScroll,
  radiusAxis,
  axisMax,
}: RadarChartProps<TDatum>) {
  // 逐轴归一（#277）。归一后半径轴刻度是 0–100 的无量纲数，写在图上只会误导，
  // 所以此时默认关掉刻度；显式传 radiusAxis 仍以消费方为准。
  const showRadiusAxis = radiusAxis ?? axisMax == null;
  const rows = data as ReadonlyArray<Record<string, unknown>>;
  const seriesKeys = series.map((s) => s.key);
  const normalized = axisMax
    ? normalizeRadarData({ data: rows, xKey, seriesKeys, axisMax })
    : null;
  if (normalized?.missingAxes.length) {
    warnOnce(
      "chart/radar-axis-max-missing",
      `[hulian] RadarChart 的 axisMax 缺少这几根轴的满量程：${normalized.missingAxes.join("、")}。已退回「该维度在当前数据里的最大值」，形状仍可比，但换一批数据图形会变。`,
    );
  }
  const chartData = normalized ? normalized.data : rows;
  return (
    <ChartFrame
      height={height}
      className={className}
      legend={legend}
      legendScroll={legendScroll}
      series={series}
    >
      {(canvasHeight) => (
      <ResponsiveContainer width="100%" height={canvasHeight} minWidth={0} minHeight={0}>
        <ReRadarChart data={chartData} margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis dataKey={xKey} tick={<PolarAngleWrapTick />} />
          {/* 半径轴刻度沿一条水平半径排列，正好穿过数据区 —— 序列一多就压在多边形上。
              echarts radar 的 axisLabel.show 默认是 false，这里默认 true 只为不动存量版式。 */}
          {showRadiusAxis ? (
            <PolarRadiusAxis
              tick={polarAngleTick}
              axisLine={false}
              // 归一后固定 0–100：让刻度跟着数据自适应会让「满量程」这件事失效。
              domain={axisMax ? [0, 100] : undefined}
            />
          ) : null}
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
          {/* 归一之后 tooltip 必须显示原始值 —— 否则运营看到的是 63.2 而不是 31.6 万，
              等于把「自己换算」这件事从业务侧挪到了用户脑子里。 */}
          <Tooltip
            contentStyle={tooltipContentStyle}
            labelStyle={tooltipLabelStyle}
            formatter={axisMax ? radarRawFormatter : undefined}
          />
        </ReRadarChart>
      </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

// 径向条形图：扁平 {name,value} 当多环进度/仪表。图例同 PieChart 走 ChartFrame。
export function RadialChart({
  data,
  height = 280,
  className,
  legend = true,
  legendScroll,
  onPointClick,
}: RadialChartProps) {
  return (
    <ChartFrame
      height={height}
      className={className}
      legend={legend}
      legendScroll={legendScroll}
      series={datumSeries(data)}
    >
      {(canvasHeight) => (
      <ResponsiveContainer width="100%" height={canvasHeight} minWidth={0} minHeight={0}>
        <ReRadialBarChart
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="25%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            dataKey="value"
            background
            cornerRadius={6}
            onClick={onPointClick ? (_, index) => onPointClick({ datum: data[index]!, index }) : undefined}
            className={onPointClick ? "cursor-pointer" : undefined}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={resolveTone(d.color) ?? chartColor(i)} />
            ))}
          </RadialBar>
          <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
        </ReRadialBarChart>
      </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}
