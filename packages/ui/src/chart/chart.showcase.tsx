"use client";
import type { ShowcaseSpec } from "../showcase/types";
import {
  AreaChart,
  BarChart,
  ComposedChart,
  LineChart,
  PieChart,
  RadarChart,
  RadialChart,
} from "./chart";

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
// 组合图（#274）：柱是千元级、线是百级，两个量纲共用一根轴会把柱压成一条底边。
const composedSeries = [
  { key: "revenue", label: "营收(千元)", type: "bar" as const },
  { key: "orders", label: "订单", type: "line" as const, axis: "right" as const },
];

// 雷达逐轴满量程（#277）：五个维度量纲差三个数量级。
// 序列键与 axisMax 的键刻意都用 ASCII：showcase 会被整体译成英文，而 AST 翻译只认字符串
// 字面量，中文一旦当了对象键（标识符）就翻不动 —— 那正是「只支持字面量翻译」那条报错。
const storeDims = [
  { dim: "销售额", hubin: 312000, xinjiekou: 186000 },
  { dim: "订单数", hubin: 640, xinjiekou: 412 },
  { dim: "客单价", hubin: 488, xinjiekou: 451 },
  { dim: "会员数", hubin: 3820, xinjiekou: 1980 },
  { dim: "退货率", hubin: 24, xinjiekou: 41 },
];
const storeSeries = [
  { key: "hubin", label: "湖滨店" },
  { key: "xinjiekou", label: "新街口店" },
];
// axisMax 的键必须与 dim 的值逐字相同，所以从同一批字面量构造，翻译时两边一起改。
const storeAxisMax = Object.fromEntries([
  ["销售额", 500000],
  ["订单数", 800],
  ["客单价", 600],
  ["会员数", 4000],
  ["退货率", 100],
]);

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
  { dim: "性能", "当前": 88, "基准": 70 },
  { dim: "稳定", "当前": 92, "基准": 80 },
  { dim: "体验", "当前": 76, "基准": 65 },
  { dim: "安全", "当前": 95, "基准": 85 },
  { dim: "成本", "当前": 68, "基准": 75 },
];
const radarSeries = [
  { key: "当前", label: "当前" },
  { key: "基准", label: "基准" },
];

const W = "w-[32rem] max-w-full";

// issue #6 复现数据：4 字 CJK / 混合类目，验证 horizontal 轴宽自适应不截断
const stageData = [
  { stage: "音频解码", p50: 105 },
  { stage: "ASR识别", p50: 620 },
  { stage: "LLM首句", p50: 890 },
  { stage: "TTS首音", p50: 760 },
];
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
      title: "图例",
      description:
        "多序列图不给图例，读者无从知道哪条线是哪条序列。legend 开一行色点（走 Dot 的 color，与序列色同源）；\"top\" / \"bottom\" 选位置。height 仍是组件总高——画布相应变矮，不会把总高撑高。",
      code: `<AreaChart data={data} series={series} xKey="month" legend />`,
      render: () => (
        <div className="flex flex-col gap-4">
          <AreaChart data={data} series={series} xKey="month" legend className={W} />
          <LineChart data={data} series={series} xKey="month" legend="top" className={W} />
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
      title: "横向柱状（CJK 类目自适应轴宽）",
      description:
        "horizontal 把类目移到 Y 轴，轴宽默认按最长标签自适应（CJK 全角估宽，48–160px），不再截断中文；要精确控制传 yAxisWidth。",
      code: `<BarChart
  horizontal
  data={[
    { stage: "音频解码", p50: 105 },
    { stage: "ASR识别", p50: 620 },
    { stage: "LLM首句", p50: 890 },
    { stage: "TTS首音", p50: 760 },
  ]}
  xKey="stage"
  series={[{ key: "p50", label: "P50 耗时(ms)" }]}
/>`,
      render: () => (
        <BarChart
          horizontal
          data={stageData}
          xKey="stage"
          series={[{ key: "p50", label: "P50 耗时(ms)" }]}
          className={W}
        />
      ),
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
      title: "双 Y 轴组合图",
      description:
        "ComposedChart 让柱与线各吃一根值轴，量纲差几个数量级的两条序列才能同框（对标 echarts 双轴）。",
      code: `<ComposedChart
  data={data}
  xKey="month"
  series={[
    { key: "revenue", label: "营收(千元)", type: "bar" },
    { key: "orders", label: "订单", type: "line", axis: "right" },
  ]}
  leftAxisLabel="营收(千元)"
  rightAxisLabel="订单"
  legend
/>`,
      render: () => (
        <ComposedChart
          data={data}
          series={composedSeries}
          xKey="month"
          leftAxisLabel="营收(千元)"
          rightAxisLabel="订单"
          legend
          className={W}
        />
      ),
    },
    {
      title: "参考线",
      description: "referenceLines 画目标线/均值线/帕累托的 80 线（对标 echarts markLine）。",
      code: `<BarChart
  data={data}
  series={[{ key: "revenue", label: "营收(千元)" }]}
  xKey="month"
  referenceLines={[{ y: 100, label: "目标" }]}
/>`,
      render: () => (
        <BarChart
          data={data}
          series={[{ key: "revenue", label: "营收(千元)" }]}
          xKey="month"
          referenceLines={[{ y: 100, label: "目标" }]}
          className={W}
        />
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
    {
      title: "逐轴满量程的雷达图",
      description:
        "axisMax 给每根角轴各配一个满量程，量纲差三个数量级也能比形状；tooltip 仍显示原始值。",
      code: `<RadarChart
  data={dims}
  series={[{ key: "hubin", label: "湖滨店" }, { key: "xinjiekou", label: "新街口店" }]}
  xKey="dim"
  axisMax={{ 销售额: 500000, 订单数: 800, 客单价: 600, 会员数: 4000, 退货率: 100 }}
/>`,
      render: () => (
        <RadarChart
          data={storeDims}
          series={storeSeries}
          xKey="dim"
          axisMax={storeAxisMax}
          className={W}
        />
      ),
    },
  ],
  controls: [
    { prop: "type", type: "select", options: [...TYPES], defaultValue: "area", label: "图表类型" },
  ],
  states: [
    {
      name: "双 Y 轴组合图（柱 + 线）",
      render: () => (
        <ComposedChart data={data} series={composedSeries} xKey="month" legend className={W} />
      ),
    },
    {
      name: "参考线（目标线）",
      render: () => (
        <BarChart
          data={data}
          series={[{ key: "revenue", label: "营收(千元)" }]}
          xKey="month"
          referenceLines={[{ y: 100, label: "目标" }]}
          className={W}
        />
      ),
    },
    {
      name: "逐轴满量程雷达图（axisMax）",
      render: () => (
        <RadarChart data={storeDims} series={storeSeries} xKey="dim" axisMax={storeAxisMax} className={W} />
      ),
    },
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
      name: "横向柱状（CJK 类目·轴宽自适应）",
      render: () => (
        <BarChart
          horizontal
          data={stageData}
          xKey="stage"
          series={[{ key: "p50", label: "P50 耗时(ms)" }]}
          className={W}
        />
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
      // 与上一档并排看：默认那档的刻度数字落在数据区里，序列一多就压住多边形。
      name: "雷达图（关半径轴刻度）",
      render: () => (
        <RadarChart data={radarData} series={radarSeries} xKey="dim" radiusAxis={false} className={W} />
      ),
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
