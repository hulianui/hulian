"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { AreaChart, BarChart, ComposedChart, LineChart, PieChart, RadarChart, RadialChart, } from "../../../../packages/ui/src/chart/chart";
const data = [
    { month: "January", revenue: 42, orders: 168 },
    { month: "February", revenue: 55, orders: 142 },
    { month: "March", revenue: 48, orders: 205 },
    { month: "April", revenue: 71, orders: 254 },
    { month: "May", revenue: 66, orders: 231 },
    { month: "June", revenue: 89, orders: 312 },
    { month: "July", revenue: 95, orders: 289 },
    { month: "August", revenue: 84, orders: 276 },
    { month: "September", revenue: 102, orders: 341 },
    { month: "October", revenue: 118, orders: 388 },
    { month: "November", revenue: 134, orders: 402 },
    { month: "December", revenue: 126, orders: 375 },
];
const composedSeries = [
    { key: "revenue", label: "Revenue (thousand yuan)", type: "bar" as const },
    { key: "orders", label: "Order", type: "line" as const, axis: "right" as const },
];
const storeDims = [
    { dim: "Revenue", hubin: 312000, xinjiekou: 186000 },
    { dim: "Number of orders", hubin: 640, xinjiekou: 412 },
    { dim: "Price per customer", hubin: 488, xinjiekou: 451 },
    { dim: "Members", hubin: 3820, xinjiekou: 1980 },
    { dim: "Return rate", hubin: 24, xinjiekou: 41 },
];
const storeSeries = [
    { key: "hubin", label: "Hubin" },
    { key: "xinjiekou", label: "Xinjiekou" },
];
const storeAxisMax = Object.fromEntries([
    ["Revenue", 500000],
    ["Number of orders", 800],
    ["Price per customer", 600],
    ["Members", 4000],
    ["Return rate", 100],
]);
const series = [
    { key: "revenue", label: "Revenue (thousand yuan)" },
    { key: "orders", label: "Order" },
];
const pieData = [
    { name: "Search", value: 420 },
    { name: "Direct", value: 280 },
    { name: "Social Media", value: 190 },
    { name: "Recommended", value: 110 },
];
const radarData = [
    { dim: "Performance", "Current": 88, "Benchmark": 70 },
    { dim: "Stable", "Current": 92, "Benchmark": 80 },
    { dim: "Experience", "Current": 76, "Benchmark": 65 },
    { dim: "Security", "Current": 95, "Benchmark": 85 },
    { dim: "Cost", "Current": 68, "Benchmark": 75 },
];
const radarSeries = [
    { key: "Current", label: "Current" },
    { key: "Benchmark", label: "Benchmark" },
];
const W = "w-[32rem] max-w-full";
const stageData = [
    { stage: "Audio decoding", p50: 105 },
    { stage: "ASR identification", p50: 620 },
    { stage: "LLM first sentence", p50: 890 },
    { stage: "TTS first tone", p50: 760 },
];
const TYPES = ["area", "bar", "line", "pie", "donut", "radar", "radial"] as const;
function renderType(type: string) {
    switch (type) {
        case "bar":
            return <BarChart data={data} series={series} xKey="month" className={W}/>;
        case "line":
            return <LineChart data={data} series={series} xKey="month" className={W}/>;
        case "pie":
            return <PieChart data={pieData} className={W}/>;
        case "donut":
            return <PieChart data={pieData} donut className={W}/>;
        case "radar":
            return <RadarChart data={radarData} series={radarSeries} xKey="dim" className={W}/>;
        case "radial":
            return <RadialChart data={pieData} className={W}/>;
        default:
            return <AreaChart data={data} series={series} xKey="month" className={W}/>;
    }
}
const CODE: Record<string, string> = {
    area: `<AreaChart data={series} series={[{ key: "revenue" }, { key: "orders" }]} xKey="month" />`,
    bar: `<BarChart data={series} series={[{ key: "revenue" }, { key: "orders" }]} xKey="month" />`,
    line: `<LineChart data={series} series={[{ key: "revenue" }, { key: "orders" }]} xKey="month" />`,
    pie: `<PieChart data={[{ name: "Search", value: 420 }, { name: "Direct", value: 280 }]} />`,
    donut: `<PieChart donut data={[{ name: "Search", value: 420 }, { name: "Direct", value: 280 }]} />`,
    radar: `<RadarChart data={radarData} series={[{ key: "current" }, { key: "baseline" }]} xKey="dim" />`,
    radial: `<RadialChart data={[{ name: "Search", value: 420 }, { name: "Direct", value: 280 }]} />`,
};
export const chartShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Area Chart",
            description: "data + series + xKey three-piece set; multi-sequence overlay, color progression chart token adaptive light and dark.",
            code: `<AreaChart
  data={data}
  series={[{ key: "revenue", label: "Revenue (thousand yuan)" }, { key: "orders", label: "Order" }]}
  xKey="month"
/>`,
            render: () => <AreaChart data={data} series={series} xKey="month" className={W}/>,
        },
        {
            title: "Polyline / Column",
            description: "The same data can be exchanged for LineChart / BarChart rendering.",
            code: `<>
  <LineChart data={data} series={series} xKey="month" />
  <BarChart data={data} series={series} xKey="month" />
</>`,
            render: () => (<div className="flex flex-col gap-4">
          <LineChart data={data} series={series} xKey="month" className={W}/>
          <BarChart data={data} series={series} xKey="month" className={W}/>
        </div>),
        },
        {
            title: "Legend",
            description: "Multi-sequence diagrams do not provide legends, so readers have no way of knowing which line is which sequence. legend opens a row of color points (take color from Dot, which is homologous to the sequence color); \"top\" / \"bottom\" selects the position. height is still the total height of the component - the canvas becomes shorter accordingly and does not increase the total height.",
            code: `<AreaChart data={data} series={series} xKey="month" legend />`,
            render: () => (<div className="flex flex-col gap-4">
          <AreaChart data={data} series={series} xKey="month" legend className={W}/>
          <LineChart data={data} series={series} xKey="month" legend="top" className={W}/>
        </div>),
        },
        {
            title: "Stacking",
            description: "stacked enables multi-sequence stacking (Area/Bar takes effect).",
            code: `<BarChart data={data} series={series} xKey="month" stacked />`,
            render: () => <BarChart data={data} series={series} xKey="month" stacked className={W}/>,
        },
        {
            title: "Horizontal columnar (CJK category adaptive axis width)",
            description: "horizontal Move the category to the Y axis. The axis width is adapted according to the longest label by default (CJK full-angle estimated width, 48\u2013160px), and Chinese characters are no longer truncated; the transmission yAxisWidth must be accurately controlled.",
            code: `<BarChart
  horizontal
  data={[
    { stage: "Audio Decoding", p50: 105 },
    { stage: "ASR identification", p50: 620 },
    { stage: "The first sentence of LLM", p50: 890 },
    { stage: "TTS first tone", p50: 760 },
  ]}
  xKey="stage"
  series={[{ key: "p50", label: "P50 Time-consuming (ms)" }]}
/>`,
            render: () => (<BarChart horizontal data={stageData} xKey="stage" series={[{ key: "p50", label: "P50 Time-consuming (ms)" }]} className={W}/>),
        },
        {
            title: "Pie Chart/Donut",
            description: "Flat {name,value} data; donut center hollowed.",
            code: `<>
  <PieChart data={[{ name: "Search", value: 420 }, { name: "Direct", value: 280 }]} />
  <PieChart donut data={[{ name: "Search", value: 420 }, { name: "Direct", value: 280 }]} />
</>`,
            render: () => (<div className="flex flex-wrap gap-4">
          <PieChart data={pieData} className="w-64 max-w-full"/>
          <PieChart data={pieData} donut className="w-64 max-w-full"/>
        </div>),
        },
        {
            title: "Dual Y axes",
            description: "ComposedChart gives bars and lines their own value axis, so two series whose units differ by orders of magnitude can share one chart (matching echarts' dual axes).",
            code: `<ComposedChart
  data={data}
  xKey="month"
  series={[
    { key: "revenue", label: "Revenue (k)", type: "bar" },
    { key: "orders", label: "Orders", type: "line", axis: "right" },
  ]}
  leftAxisLabel="Revenue (k)"
  rightAxisLabel="Orders"
  legend
/>`,
            render: () => (<ComposedChart data={data} series={composedSeries} xKey="month" leftAxisLabel="Revenue (thousand yuan)" rightAxisLabel="Order" legend className={W}/>),
        },
        {
            title: "Reference lines",
            description: "referenceLines draws target lines, average lines, and the 80% line of a Pareto chart (matching echarts markLine).",
            code: `<BarChart
  data={data}
  series={[{ key: "revenue", label: "Revenue (k)" }]}
  xKey="month"
  referenceLines={[{ y: 100, label: "Target" }]}
/>`,
            render: () => (<BarChart data={data} series={[{ key: "revenue", label: "Revenue (thousand yuan)" }]} xKey="month" referenceLines={[{ y: 100, label: "Target" }]} className={W}/>),
        },
        {
            title: "Radar chart",
            description: "Comparison of multi-dimensional capabilities, xKey is the dimension field, multi-sequence superposition.",
            code: `<RadarChart
  data={radarData}
  series={[{ key: "Current" }, { key: "Benchmark" }]}
  xKey="dim"
/>`,
            render: () => <RadarChart data={radarData} series={radarSeries} xKey="dim" className={W}/>,
        },
        {
            title: "Radar with per-axis full scale",
            description: "axisMax gives every angle axis its own full scale, so shapes stay comparable across three orders of magnitude; the tooltip still shows the original values.",
            code: `<RadarChart
  data={dims}
  series={[{ key: "hubin", label: "Hubin" }, { key: "xinjiekou", label: "Xinjiekou" }]}
  xKey="dim"
  axisMax={{ Revenue: 500000, Orders: 800, "Avg order": 600, Members: 4000, "Return rate": 100 }}
/>`,
            render: () => (<RadarChart data={storeDims} series={storeSeries} xKey="dim" axisMax={storeAxisMax} className={W}/>),
        },
    ],
    controls: [
        { prop: "type", type: "select", options: [...TYPES], defaultValue: "area", label: "Chart Type" },
    ],
    states: [
        {
            name: "Dual Y axes (bars + line)",
            render: () => (<ComposedChart data={data} series={composedSeries} xKey="month" legend className={W}/>),
        },
        {
            name: "Reference line (target)",
            render: () => (<BarChart data={data} series={[{ key: "revenue", label: "Revenue (thousand yuan)" }]} xKey="month" referenceLines={[{ y: 100, label: "Target" }]} className={W}/>),
        },
        {
            name: "Per-axis full scale radar (axisMax)",
            render: () => (<RadarChart data={storeDims} series={storeSeries} xKey="dim" axisMax={storeAxisMax} className={W}/>),
        },
        {
            name: "Area Chart (Multiple Series)",
            render: () => <AreaChart data={data} series={series} xKey="month" className={W}/>,
        },
        {
            name: "Stacking area",
            render: () => <AreaChart data={data} series={series} xKey="month" stacked className={W}/>,
        },
        {
            name: "Line Chart (Multiple Series)",
            render: () => <LineChart data={data} series={series} xKey="month" className={W}/>,
        },
        {
            name: "Histogram (Multiple Series)",
            render: () => <BarChart data={data} series={series} xKey="month" className={W}/>,
        },
        {
            name: "Stacked Column",
            render: () => <BarChart data={data} series={series} xKey="month" stacked className={W}/>,
        },
        {
            name: "Horizontal columnar",
            render: () => (<BarChart data={data.slice(0, 6)} series={series} xKey="month" horizontal className={W}/>),
        },
        {
            name: "Horizontal columnar (CJK category\u00B7axis width adaptive)",
            render: () => (<BarChart horizontal data={stageData} xKey="stage" series={[{ key: "p50", label: "P50 Time-consuming (ms)" }]} className={W}/>),
        },
        {
            name: "Pie Chart",
            render: () => <PieChart data={pieData} className={W}/>,
        },
        {
            name: "Donut Chart",
            render: () => <PieChart data={pieData} donut className={W}/>,
        },
        {
            name: "Radar chart (multi-sequence)",
            render: () => <RadarChart data={radarData} series={radarSeries} xKey="dim" className={W}/>,
        },
        {
            name: "Radar chart (radius-axis ticks off)",
            render: () => (<RadarChart data={radarData} series={radarSeries} xKey="dim" radiusAxis={false} className={W}/>),
        },
        {
            name: "Radial Progress",
            render: () => <RadialChart data={pieData} className={W}/>,
        },
        {
            name: "Single sequence area",
            render: () => (<AreaChart data={data} series={[{ key: "revenue", label: "Revenue" }]} xKey="month" className={W}/>),
        },
    ],
    renderWithProps: (p) => renderType(p.type as string),
    toCode: (p) => CODE[p.type as string] ?? CODE.area,
};
