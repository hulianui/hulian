"use client";
import { makeTimeseries } from "@hulian/mocks";
import type { ShowcaseSpec } from "../showcase/types";
import { AreaChart, BarChart } from "./chart";

// mock① 真实样例：faker 确定性时间序列（防 hydration mismatch）
const data = makeTimeseries(12);
const series = [
  { key: "revenue", label: "营收(千元)" },
  { key: "orders", label: "订单" },
];

export const chartShowcase: ShowcaseSpec = {
  controls: [
    { prop: "type", type: "select", options: ["area", "bar"], defaultValue: "area", label: "图表类型" },
  ],
  states: [
    {
      name: "面积图（多序列）",
      render: () => <AreaChart data={data} series={series} xKey="month" className="max-w-xl" />,
    },
    {
      name: "柱状图（多序列）",
      render: () => <BarChart data={data} series={series} xKey="month" className="max-w-xl" />,
    },
    {
      name: "单序列面积",
      render: () => (
        <AreaChart data={data} series={[{ key: "revenue", label: "营收" }]} xKey="month" className="max-w-xl" />
      ),
    },
  ],
  renderWithProps: (p) =>
    p.type === "bar" ? (
      <BarChart data={data} series={series} xKey="month" className="max-w-xl" />
    ) : (
      <AreaChart data={data} series={series} xKey="month" className="max-w-xl" />
    ),
  toCode: (p) =>
    `<${p.type === "bar" ? "BarChart" : "AreaChart"}\n  data={series}\n  series={[{ key: "revenue", label: "营收" }, { key: "orders", label: "订单" }]}\n  xKey="month"\n/>`,
};
