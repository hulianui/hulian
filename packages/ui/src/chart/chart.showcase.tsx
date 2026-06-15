"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { AreaChart, BarChart, LineChart, PieChart, RadarChart, RadialChart } from "./chart";

// 内联静态样例（确定性，防 SSR/CSR hydration mismatch）——
// 刻意不依赖 @hulianui/mocks/faker：demo 数据不该把 dev-only 依赖带进组件库导出图。
const data = [
  { month: "1月", revenue: 42, orders: 168 },
  { month: "2月", revenue: 55, orders: 142 },
  { month: "3月", revenue: 48, orders: 205 },
  { month: "4月", revenue: 71, orders: 254 },
  { month: "5月", revenue: 66, orders: 231 },
  { month: "6月", revenue: 89, orders: 312 },
  { month: "7月", revenue: 95, orders: 289 },
  { month: "8月", revenue: 84, orders: 276 },
  { month: "9月", revenue: 102, orders: 341 },
  { month: "10月", revenue: 118, orders: 388 },
  { month: "11月", revenue: 134, orders: 402 },
  { month: "12月", revenue: 126, orders: 375 },
];
const series = [
  { key: "revenue", label: "营收(千元)" },
  { key: "orders", label: "订单" },
];

// 饼图/环形/径向：扁平 {name,value}，静态确定性（hydration 安全）
const pieData = [
  { name: "搜索", value: 420 },
  { name: "直接", value: 280 },
  { name: "社媒", value: 190 },
  { name: "推荐", value: 110 },
];

// 雷达：多维能力对比，xKey=维度
const radarData = [
  { dim: "性能", 当前: 88, 基准: 70 },
  { dim: "稳定", 当前: 92, 基准: 80 },
  { dim: "体验", 当前: 76, 基准: 65 },
  { dim: "安全", 当前: 95, 基准: 85 },
  { dim: "成本", 当前: 68, 基准: 75 },
];
const radarSeries = [
  { key: "当前", label: "当前" },
  { key: "基准", label: "基准" },
];

const W = "w-[32rem] max-w-full";
const TYPES = ["area", "bar", "line", "pie", "donut", "radar", "radial"] as const;

function renderType(type: string) {
  switch (type) {
    case "bar":
      return <BarChart data={data} series={series} xKey="month" className={W} />;
    case "line":
      return <LineChart data={data} series={series} xKey="month" className={W} />;
    case "pie":
      return <PieChart data={pieData} className={W} />;
    case "donut":
      return <PieChart data={pieData} donut className={W} />;
    case "radar":
      return <RadarChart data={radarData} series={radarSeries} xKey="dim" className={W} />;
    case "radial":
      return <RadialChart data={pieData} className={W} />;
    default:
      return <AreaChart data={data} series={series} xKey="month" className={W} />;
  }
}

const CODE: Record<string, string> = {
  area: `<AreaChart data={series} series={[{ key: "revenue" }, { key: "orders" }]} xKey="month" />`,
  bar: `<BarChart data={series} series={[{ key: "revenue" }, { key: "orders" }]} xKey="month" />`,
  line: `<LineChart data={series} series={[{ key: "revenue" }, { key: "orders" }]} xKey="month" />`,
  pie: `<PieChart data={[{ name: "搜索", value: 420 }, { name: "直接", value: 280 }]} />`,
  donut: `<PieChart donut data={[{ name: "搜索", value: 420 }, { name: "直接", value: 280 }]} />`,
  radar: `<RadarChart data={radarData} series={[{ key: "当前" }, { key: "基准" }]} xKey="dim" />`,
  radial: `<RadialChart data={[{ name: "搜索", value: 420 }, { name: "直接", value: 280 }]} />`,
};

export const chartShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "面积图",
      description: "data + series + xKey 三件套；多序列叠加，色彩走 chart token 自适应明暗。",
      code: `<AreaChart
  data={data}
  series={[{ key: "revenue", label: "营收(千元)" }, { key: "orders", label: "订单" }]}
  xKey="month"
/>`,
      render: () => <AreaChart data={data} series={series} xKey="month" className={W} />,
    },
    {
      title: "折线 / 柱状",
      description: "同一份数据可换 LineChart / BarChart 渲染。",
      code: `<>
  <LineChart data={data} series={series} xKey="month" />
  <BarChart data={data} series={series} xKey="month" />
</>`,
      render: () => (
        <div className="flex flex-col gap-4">
          <LineChart data={data} series={series} xKey="month" className={W} />
          <BarChart data={data} series={series} xKey="month" className={W} />
        </div>
      ),
    },
    {
      title: "堆叠",
      description: "stacked 让多序列堆叠（Area/Bar 生效）。",
      code: `<BarChart data={data} series={series} xKey="month" stacked />`,
      render: () => <BarChart data={data} series={series} xKey="month" stacked className={W} />,
    },
    {
      title: "饼图 / 环形",
      description: "扁平 {name,value} 数据；donut 中心挖空。",
      code: `<>
  <PieChart data={[{ name: "搜索", value: 420 }, { name: "直接", value: 280 }]} />
  <PieChart donut data={[{ name: "搜索", value: 420 }, { name: "直接", value: 280 }]} />
</>`,
      render: () => (
        <div className="flex flex-wrap gap-4">
          <PieChart data={pieData} className="w-64 max-w-full" />
          <PieChart data={pieData} donut className="w-64 max-w-full" />
        </div>
      ),
    },
    {
      title: "雷达图",
      description: "多维能力对比，xKey 为维度字段，多序列叠加。",
      code: `<RadarChart
  data={radarData}
  series={[{ key: "当前" }, { key: "基准" }]}
  xKey="dim"
/>`,
      render: () => <RadarChart data={radarData} series={radarSeries} xKey="dim" className={W} />,
    },
  ],
  controls: [
    { prop: "type", type: "select", options: [...TYPES], defaultValue: "area", label: "图表类型" },
  ],
  states: [
    {
      name: "面积图（多序列）",
      render: () => <AreaChart data={data} series={series} xKey="month" className={W} />,
    },
    {
      name: "堆叠面积",
      render: () => <AreaChart data={data} series={series} xKey="month" stacked className={W} />,
    },
    {
      name: "折线图（多序列）",
      render: () => <LineChart data={data} series={series} xKey="month" className={W} />,
    },
    {
      name: "柱状图（多序列）",
      render: () => <BarChart data={data} series={series} xKey="month" className={W} />,
    },
    {
      name: "堆叠柱状",
      render: () => <BarChart data={data} series={series} xKey="month" stacked className={W} />,
    },
    {
      name: "横向柱状",
      render: () => (
        <BarChart data={data.slice(0, 6)} series={series} xKey="month" horizontal className={W} />
      ),
    },
    {
      name: "饼图",
      render: () => <PieChart data={pieData} className={W} />,
    },
    {
      name: "环形图",
      render: () => <PieChart data={pieData} donut className={W} />,
    },
    {
      name: "雷达图（多序列）",
      render: () => <RadarChart data={radarData} series={radarSeries} xKey="dim" className={W} />,
    },
    {
      name: "径向进度",
      render: () => <RadialChart data={pieData} className={W} />,
    },
    {
      name: "单序列面积",
      render: () => (
        <AreaChart data={data} series={[{ key: "revenue", label: "营收" }]} xKey="month" className={W} />
      ),
    },
  ],
  renderWithProps: (p) => renderType(p.type as string),
  toCode: (p) => CODE[p.type as string] ?? CODE.area,
};
