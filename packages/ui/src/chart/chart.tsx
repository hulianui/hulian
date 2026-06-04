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
} from "recharts";
import { cn } from "../lib/cn";
import {
  chartColor,
  axisProps,
  gridProps,
  tooltipContentStyle,
  tooltipLabelStyle,
  polarAngleTick,
  legendStyle,
} from "./chart-theme";
import type { ChartProps, BarChartProps, PieChartProps, RadialChartProps } from "./chart.types";

const MARGIN = { top: 8, right: 8, bottom: 0, left: -8 };

// recharts 引擎（坐标系/比例尺/路径）+ 瑚琏皮肤（SVG 色走 var(--color-chart-N)/token，明暗自适应）。
export function AreaChart<TDatum>({
  data,
  series,
  xKey,
  height = 280,
  className,
  stacked,
}: ChartProps<TDatum>) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <ReAreaChart data={data} margin={MARGIN}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
          {series.map((s, i) => {
            const color = s.color ?? chartColor(i);
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
    </div>
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
}: BarChartProps<TDatum>) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <ReBarChart
          data={data}
          margin={MARGIN}
          layout={horizontal ? "vertical" : "horizontal"}
        >
          <CartesianGrid {...gridProps} vertical={horizontal} horizontal={!horizontal} />
          {horizontal ? (
            <>
              <XAxis type="number" {...axisProps} />
              <YAxis type="category" dataKey={xKey} {...axisProps} width={48} />
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
              fill={s.color ?? chartColor(i)}
              radius={
                horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]
              }
            />
          ))}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineChart<TDatum>({
  data,
  series,
  xKey,
  height = 280,
  className,
}: ChartProps<TDatum>) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <ReLineChart data={data} margin={MARGIN}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
          <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
          {series.map((s, i) => {
            const color = s.color ?? chartColor(i);
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
    </div>
  );
}

// 饼图 / 环形图：扁平 {name,value} 数据，每片走 chart token。
export function PieChart({ data, donut, height = 280, className }: PieChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
              <Cell key={d.name} fill={d.color ?? chartColor(i)} />
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
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <ReRadarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis dataKey={xKey} tick={polarAngleTick} />
          <PolarRadiusAxis tick={polarAngleTick} axisLine={false} />
          {series.map((s, i) => {
            const color = s.color ?? chartColor(i);
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
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
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
              <Cell key={d.name} fill={d.color ?? chartColor(i)} />
            ))}
          </RadialBar>
          <Tooltip contentStyle={tooltipContentStyle} labelStyle={tooltipLabelStyle} />
          <Legend wrapperStyle={legendStyle} />
        </ReRadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
