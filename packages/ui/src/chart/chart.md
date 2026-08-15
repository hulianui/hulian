---
slug: chart
name: Chart
category: data-display
group: stat
tags: []
exports: [AreaChart, BarChart, ComposedChart, LineChart, PieChart, RadarChart, RadialChart, chartColor, categoryAxisWidth]
status: enriched
---

# Chart

> 图表 · recharts 直裹 + chart token 皮肤(Area/Bar) · data-display/stat

## 何时用

仪表盘里画趋势/分布/对比图（面积、柱、线、饼、环、雷达、径向），自动套瑚琏 chart token 配色。要展示单个 KPI 数字用 [Stat](../stat/stat.md)/[Statistic](../statistic/statistic.md)；要轻量内联趋势走 [Sparkline]；本组件是完整的多序列坐标图，基于 recharts。

## 导入
```ts
import { AreaChart, BarChart, ComposedChart, LineChart, PieChart, RadarChart, RadialChart, chartColor } from "@hulianui/ui"
```

## Props

### AreaChart / BarChart / LineChart / ComposedChart / RadarChart（笛卡尔类）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| data* | `TDatum[]` | — | 行数据数组 |
| series* | `ChartSeries[]` | — | 序列定义 `{ key, label?, color? }`；color 缺省按 index 取 `var(--color-chart-N)`，可传语义色名/CSS 颜色覆盖 |
| xKey* | `string` | — | 横轴字段名 |
| height | `number` | `280` | 高度（SSR 安全：宽走 ResponsiveContainer，高需显式值） |
| stacked | `boolean` | `false` | 多序列堆叠（Area/Bar 生效） |
| legend | `boolean \| "top" \| "bottom"` | `false`（Radar 为 `true`） | 序列图例（色点 + `label`）。`true` 等价 `"bottom"`，`false` 关掉。色点走 [Dot](../dot/dot.md) 的 `color`，与序列色同源。**默认值按图种分两档**：笛卡尔三件默认关，Radar 默认开（历来自带图例，保持零改动） |
| legendScroll | `boolean` | `false` | 图例恒为单行 + 横向滚动（对齐 echarts `legend.type: "scroll"`）。缺省是换行居中，序列一多就堆成多行挤扁画布；序列 >8 条开这个 |
| horizontal | `boolean` | `false` | **BarChart 专属**：横向柱状 |
| yAxisWidth | `number` | 自适应 | **BarChart 专属**：horizontal 类目轴宽 px；默认按最长标签自适应（CJK 全角估宽·48–160，纯函数 `categoryAxisWidth` 可测），超长标签或精确控制时显式传 |
| radiusAxis | `boolean` | `true` | **RadarChart 专属**：半径轴的刻度数字（`0 15 30 …`）。传 `false` 只留环线与角轴名，即 echarts radar 的默认形态（它的 `axisLabel.show` 默认就是 `false`）。**如果**你的雷达图序列较多或数据填得满，建议关掉——见下方注意事项 |
| onPointClick | `(info: { datum, index, seriesKey? }) => void` | — | 数据点点击（对标 echarts 的 `chart.on('click')`，用于钻取）。命中判据与 tooltip 同源：**tooltip 亮了点下去就一定有回调**，不必精确点中 2px 的折线；点在画布空白或坐标轴上不触发。`seriesKey` **不保证有值**（共享 tooltip 时 recharts 不认为某一条序列被单独命中）。**RadarChart 没有这个 prop** |
| referenceLines | `ChartReferenceLine[]` | — | 值轴参考线（对标 echarts 的 `markLine`）：帕累托的 80/95 线、均值线、目标线。见下方 `ChartReferenceLine` 表。**RadarChart 没有这个 prop** |
| series[].type | `"bar" \| "line" \| "area"` | `"bar"` | **ComposedChart 专属**：该序列画成什么 |
| series[].axis | `"left" \| "right"` | `"left"` | **ComposedChart 专属**：该序列吃哪根值轴 |
| leftAxisLabel / rightAxisLabel | `string` | — | **ComposedChart 专属**：轴标题。左右各画各的量纲时不标名字，读者分不出哪条线读哪根轴 |
| axisMax | `Record<string, number>` | — | **RadarChart 专属**：每根角轴各自的满量程，键是角轴维度值。见下方「量纲差很多的雷达图」 |
| className | `string` | — | 透传类名（宽度在此设，如 `w-[32rem]`） |

### PieChart / RadialChart（扁平数据类）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| data* | `ChartDatum[]` | — | 扁平数据点 `{ name, value, color? }` |
| donut | `boolean` | `false` | **PieChart**：环形图（中心挖空） |
| height | `number` | `280` | 高度 |
| legend | `boolean \| "top" \| "bottom"` | `true` | 图例（色点 + `data[].name`），语义同上但**默认开**（这两件历来自带图例）。传 `false` 关掉——自绘图例时必须关，否则两份图例并排 |
| legendScroll | `boolean` | `false` | 同上：图例恒为单行 + 横向滚动 |
| onPointClick | `(info: { datum, index }) => void` | — | 点中某一片时回调（钻取用）。扇区级命中，点在留白处不触发 |
| className | `string` | — | 透传类名 |

### ChartReferenceLine

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| y* | `number` | — | 值轴上的位置 |
| label | `string` | — | 线上文案（如「80%」「目标」） |
| axis | `"left" \| "right"` | `"left"` | 挂在哪根值轴上，仅 ComposedChart 有意义 |
| color | `string` | `--color-muted-foreground` | 线色。缺省刻意不取 `chart-N`：它不是一条数据，抢了序列的色相会被读成「第 N 条序列」 |
| dash | `string` | `"4 4"` | 虚线段样式，传空串即实线 |

## 示例
```tsx
// 多序列面积图（颜色自动取 chart token）——多序列务必开 legend，否则读者不知道哪条线是哪条
const data = [{ month: "1月", revenue: 42, orders: 168 }, { month: "2月", revenue: 55, orders: 142 }];
<AreaChart data={data} series={[{ key: "revenue", label: "营收" }, { key: "orders", label: "订单" }]} xKey="month" legend className="w-[32rem]" />

// 环形图
<PieChart donut data={[{ name: "搜索", value: 420 }, { name: "直接", value: 280 }]} className="w-[32rem]" />

// 关掉自带图例（自绘时必须关），或让几十条序列的图例单行横滚而不吃画布
<RadarChart legend={false} data={data} series={series} xKey="indicator" height={320} />
<RadarChart legendScroll data={data} series={series28} xKey="indicator" height={320} />

// 多序列雷达图：图例单行横滚 + 关掉半径轴刻度（刻度会压在数据多边形上，见注意事项）
<RadarChart legendScroll radiusAxis={false} data={data} series={series28} xKey="indicator" height={320} />

// 横向柱状：CJK 类目轴宽自适应（≥4 字不再截断）
<BarChart
  horizontal
  data={[{ stage: "音频解码", p50: 105 }, { stage: "TTS首音", p50: 760 }]}
  xKey="stage"
  series={[{ key: "p50" }]}
/>
```

### 双量纲：柱 + 线各吃一根轴

一个类目轴上同时画柱与线、各自吃一条 Y 轴（销售额 ¥十万级 + 订单数 百级）用 `ComposedChart`：

```tsx
<ComposedChart
  data={data}
  xKey="month"
  series={[
    { key: "revenue", label: "销售额", type: "bar" },
    { key: "orders", label: "订单数", type: "line", axis: "right" },
  ]}
  leftAxisLabel="销售额（元）"
  rightAxisLabel="订单数"
  legend
/>
```

帕累托图就是「柱 + 累计占比线 + 80/95 参考线」：

```tsx
<ComposedChart
  data={pareto}
  xKey="sku"
  series={[
    { key: "amount", label: "销售额", type: "bar" },
    { key: "cumulative", label: "累计占比", type: "line", axis: "right" },
  ]}
  referenceLines={[
    { y: 80, label: "80%", axis: "right" },
    { y: 95, label: "95%", axis: "right" },
  ]}
/>
```

`stacked` 只在**同轴同图种**的柱之间成立：两根轴的量纲不同，把它们相加得到的是没有意义的数，所以堆叠分组按轴隔开。

### 点击钻取

```tsx
<BarChart
  data={daily}
  series={[{ key: "count", label: "订单数" }]}
  xKey="date"
  onPointClick={({ datum }) => openDetail(datum.date)}
/>
```

只透事件不管路由：跳页、开抽屉、带 query 这些语义留在业务侧。饼图用同名 prop，回调形状是 `{ datum, index }`（一片就是一个数据点，没有序列的概念）。

### 量纲差很多的雷达图

五根轴分别是销售额（十万级）/ 订单数（百级）/ 退货率（0–100）时，单一刻度会把量纲小的轴全压成靠近圆心的一个点——图还在，形状对比没了。给 `axisMax` 逐轴配满量程：

```tsx
<RadarChart
  data={dims}
  xKey="dim"
  series={[{ key: "storeA", label: "湖滨店" }, { key: "storeB", label: "南京西路店" }]}
  axisMax={{ 销售额: 500000, 订单数: 800, 客单价: 600, 会员数: 4000, 退货率: 100 }}
/>
```

**tooltip 仍显示原始值**——自己在业务侧先归一再喂进来也能得到同样的形状，但 tooltip 里就只剩归一值，运营得自己换算回去。

某个维度没在 `axisMax` 里给出时退回「该维度在当前数据里的最大值」并在开发期告警：混着归一和不归一才是最糟的，那根轴会莫名其妙地贴着圆心或顶满外环。开启 `axisMax` 后半径轴刻度默认关闭（0–100 的归一刻度没有意义），需要的话显式传 `radiusAxis`。

## 禁忌 / 坑
- 宽度交给父容器 / className，**高度必须显式**（`height` 默认 280）——宽走 ResponsiveContainer 但高拿不到会塌成 0。
- 在收缩的 flex 容器里 ResponsiveContainer 可能量不到宽，需给容器显式宽度，见 [[recharts-responsive-container-needs-explicit-width-in-shrink-flex]]。
- headless 截图常出现「只剩坐标轴、数据区空白」——不是 bug，是入场动画的 clipPath 被 rAF 饿死，设 `prefers-reduced-motion: reduce` 再截即显，见 [[recharts-headless-screenshot-blank-clippath-animation-starved]]。
- horizontal 类目轴宽自适应有 160px 上限（防超长标签吃掉图区）——类目 >12 个全角字仍会截断，此时消费侧截短标签或显式传 `yAxisWidth`。
- `legend` 开启后 `height` 仍是**组件总高**：图例占一行，画布相应变矮，不会把总高撑高。序列多到换行时图例会堆成多行、继续挤压画布——**这时候不要靠调大 `height` 硬扛**（28 条序列的图例是 5 行，把雷达盘撑回可读尺寸得把总高翻倍），开 `legendScroll` 让图例恒为单行横滚。
- 极坐标三件（Pie/Radar/Radial）的 `legend` **默认是 `true`**，与笛卡尔三件相反——它们历来自带图例，改默认会破坏存量版式。自绘图例前先 `legend={false}`，否则两份图例并排。
- 自绘图例时色点用 `<Dot color={...} />`，**不要**写 `<Dot style={{ color }} />`——那是静默失效（圆点是背景色），见 [Dot 的坑](../dot/dot.md)。
- RadarChart 的半径轴刻度（`radiusAxis`，默认开）**画在数据区里而不是外面**：刻度锚点沿一条水平半径均匀排开，正好从雷达盘中心穿到边缘，而且每个数字被 recharts 旋转 90° 竖排。序列一多、数据填得满，前几个刻度就整个落在数据多边形内部，既压住图形又难读。这一条**看版式是发现不了「选错了」的**——图能正常渲染，只是糊在一起。多序列雷达图建议直接 `radiusAxis={false}`：雷达图读的是形状对比，精确取值有 tooltip。

## 相关
[Stat](../stat/stat.md) · [Statistic](../statistic/statistic.md) · [Meter](../meter/meter.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
