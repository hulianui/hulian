---
slug: chart
name: Chart
category: data-display
group: stat
tags: []
exports: [AreaChart, BarChart, LineChart, PieChart, RadarChart, RadialChart, chartColor, categoryAxisWidth]
status: enriched
---

# Chart

> 图表 · recharts 直裹 + chart token 皮肤(Area/Bar) · data-display/stat

## 何时用

仪表盘里画趋势/分布/对比图（面积、柱、线、饼、环、雷达、径向），自动套瑚琏 chart token 配色。要展示单个 KPI 数字用 [Stat](../stat/stat.md)/[Statistic](../statistic/statistic.md)；要轻量内联趋势走 [Sparkline]；本组件是完整的多序列坐标图，基于 recharts。

## 导入
```ts
import { AreaChart, BarChart, LineChart, PieChart, RadarChart, RadialChart, chartColor } from "@hulianui/ui"
```

## Props

### AreaChart / BarChart / LineChart / RadarChart（笛卡尔类）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| data* | `TDatum[]` | — | 行数据数组 |
| series* | `ChartSeries[]` | — | 序列定义 `{ key, label?, color? }`；color 缺省按 index 取 `var(--color-chart-N)`，可传语义色名/CSS 颜色覆盖 |
| xKey* | `string` | — | 横轴字段名 |
| height | `number` | `280` | 高度（SSR 安全：宽走 ResponsiveContainer，高需显式值） |
| stacked | `boolean` | `false` | 多序列堆叠（Area/Bar 生效） |
| legend | `boolean \| "top" \| "bottom"` | `false` | 序列图例（色点 + `label`）。`true` 等价 `"bottom"`；**AreaChart / BarChart / LineChart 生效**（Pie/Radar/Radial 一直自带图例）。色点走 [Dot](../dot/dot.md) 的 `color`，与序列色同源 |
| horizontal | `boolean` | `false` | **BarChart 专属**：横向柱状 |
| yAxisWidth | `number` | 自适应 | **BarChart 专属**：horizontal 类目轴宽 px；默认按最长标签自适应（CJK 全角估宽·48–160，纯函数 `categoryAxisWidth` 可测），超长标签或精确控制时显式传 |
| className | `string` | — | 透传类名（宽度在此设，如 `w-[32rem]`） |

### PieChart / RadialChart（扁平数据类）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| data* | `ChartDatum[]` | — | 扁平数据点 `{ name, value, color? }` |
| donut | `boolean` | `false` | **PieChart**：环形图（中心挖空） |
| height | `number` | `280` | 高度 |
| className | `string` | — | 透传类名 |

## 示例
```tsx
// 多序列面积图（颜色自动取 chart token）——多序列务必开 legend，否则读者不知道哪条线是哪条
const data = [{ month: "1月", revenue: 42, orders: 168 }, { month: "2月", revenue: 55, orders: 142 }];
<AreaChart data={data} series={[{ key: "revenue", label: "营收" }, { key: "orders", label: "订单" }]} xKey="month" legend className="w-[32rem]" />

// 环形图
<PieChart donut data={[{ name: "搜索", value: 420 }, { name: "直接", value: 280 }]} className="w-[32rem]" />

// 横向柱状：CJK 类目轴宽自适应（≥4 字不再截断）
<BarChart
  horizontal
  data={[{ stage: "音频解码", p50: 105 }, { stage: "TTS首音", p50: 760 }]}
  xKey="stage"
  series={[{ key: "p50" }]}
/>
```

## 禁忌 / 坑
- 宽度交给父容器 / className，**高度必须显式**（`height` 默认 280）——宽走 ResponsiveContainer 但高拿不到会塌成 0。
- 在收缩的 flex 容器里 ResponsiveContainer 可能量不到宽，需给容器显式宽度，见 [[recharts-responsive-container-needs-explicit-width-in-shrink-flex]]。
- headless 截图常出现「只剩坐标轴、数据区空白」——不是 bug，是入场动画的 clipPath 被 rAF 饿死，设 `prefers-reduced-motion: reduce` 再截即显，见 [[recharts-headless-screenshot-blank-clippath-animation-starved]]。
- horizontal 类目轴宽自适应有 160px 上限（防超长标签吃掉图区）——类目 >12 个全角字仍会截断，此时消费侧截短标签或显式传 `yAxisWidth`。
- `legend` 开启后 `height` 仍是**组件总高**：图例占一行，画布相应变矮，不会把总高撑高。图例序列多到换行时会挤压画布，那种情况把 `height` 调大或缩短 `label`。
- 自绘图例时色点用 `<Dot color={...} />`，**不要**写 `<Dot style={{ color }} />`——那是静默失效（圆点是背景色），见 [Dot 的坑](../dot/dot.md)。

## 相关
[Stat](../stat/stat.md) · [Statistic](../statistic/statistic.md) · [Meter](../meter/meter.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
