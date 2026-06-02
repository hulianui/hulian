"use client";
import {
  ResponsiveContainer,
  AreaChart as ReAreaChart,
  BarChart as ReBarChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { cn } from "../lib/cn";
import {
  chartColor,
  axisProps,
  gridProps,
  tooltipContentStyle,
  tooltipLabelStyle,
} from "./chart-theme";
import type { ChartProps } from "./chart.types";

const MARGIN = { top: 8, right: 8, bottom: 0, left: -8 };

// recharts 引擎（坐标系/比例尺/路径）+ 瑚琏皮肤（SVG 色走 var(--color-chart-N)/token，明暗自适应）。
export function AreaChart<TDatum extends Record<string, unknown>>({
  data,
  series,
  xKey,
  height = 280,
  className,
}: ChartProps<TDatum>) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
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
                stroke={color}
                fill={color}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            );
          })}
        </ReAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChart<TDatum extends Record<string, unknown>>({
  data,
  series,
  xKey,
  height = 280,
  className,
}: ChartProps<TDatum>) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={MARGIN}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} />
          <YAxis {...axisProps} />
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
              fill={s.color ?? chartColor(i)}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
