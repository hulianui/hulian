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

> Theme-token wrappers around Recharts area, bar, line, pie, donut, radar, and radial charts.

## When to use

Use Chart for complete dashboard trends, distributions, and comparisons with one or more series. Use [Stat](../stat/stat.md) or [Statistic](../statistic/statistic.md) for one KPI and Sparkline for a lightweight inline trend.

## Import
```ts
import { AreaChart, BarChart, ComposedChart, LineChart, PieChart, RadarChart, RadialChart, chartColor } from "@hulianui/ui"
```

## Props

### AreaChart / BarChart / LineChart / ComposedChart / RadarChart (Cartesian)

| Name | Type | Default | Description |
|------|------|------|------|
| data* | `TDatum[]` | — | Row data. |
| series* | `ChartSeries[]` | — | `{ key, label?, color? }`; colors default by index to chart tokens. |
| xKey* | `string` | — | Horizontal-axis field. |
| height | `number` | `280` | Explicit SSR-safe height. |
| stacked | `boolean` | `false` | Stacks AreaChart or BarChart series. |
| legend | `boolean \| "top" \| "bottom"` | `false` (`true` for RadarChart) | Series legend with a color dot and `label`. `true` is equivalent to `"bottom"`; `false` turns it off. Dot colors come from the same source as the series through [Dot](../dot/dot.md)'s `color` prop. **The default splits by chart family**: the Cartesian three default to off, while RadarChart defaults to on because it has always shipped a legend. |
| legendScroll | `boolean` | `false` | Keeps the legend on a single horizontally scrollable row (matching echarts' `legend.type: "scroll"`). The default wraps and centers, which stacks into several rows and squeezes the canvas once there are many series. Enable it beyond ~8 series. |
| horizontal | `boolean` | `false` | BarChart-only horizontal orientation. |
| yAxisWidth | `number` | Adaptive | BarChart-only category-axis width; horizontal mode estimates 48-160 px through `categoryAxisWidth`. |
| radiusAxis | `boolean` | `true` | RadarChart-only radius-axis tick numbers (`0 15 30 …`). Pass `false` to keep only the grid rings and angle labels, which is what echarts' radar renders by default (its `axisLabel.show` defaults to `false`). **If** your radar has many series or densely filled data, turning it off is recommended — see the pitfalls below. |
| onPointClick | `(info: { datum, index, seriesKey? }) => void` | — | Data-point click, matching echarts' `chart.on('click')` for drill-down. Hit detection shares its rule with the tooltip: **if the tooltip is showing, a click always fires**, so there is no need to hit a 2px line exactly; clicks on empty canvas or on an axis do not fire. `seriesKey` is **not guaranteed**: with a shared tooltip recharts does not consider any single series to be hit. **RadarChart does not have this prop.** |
| referenceLines | `ChartReferenceLine[]` | — | Value-axis reference lines, matching echarts' `markLine`: the 80/95 lines of a Pareto chart, an average line, a target line. See the `ChartReferenceLine` table below. **RadarChart does not have this prop.** |
| series[].type | `"bar" \| "line" \| "area"` | `"bar"` | **ComposedChart only**: how this series is drawn. |
| series[].axis | `"left" \| "right"` | `"left"` | **ComposedChart only**: which value axis this series reads. |
| leftAxisLabel / rightAxisLabel | `string` | — | **ComposedChart only**: axis titles. With two different units in play, unlabeled axes leave readers unable to tell which line reads which axis. |
| axisMax | `Record<string, number>` | — | **RadarChart only**: full scale per angle axis, keyed by the angle-axis value. See "Radars with mismatched units". |
| className | `string` | — | Custom class, commonly used for width. |

### PieChart / RadialChart (flat data)

| Name | Type | Default | Description |
|------|------|------|------|
| data* | `ChartDatum[]` | — | Flat `{ name, value, color? }` data. |
| donut | `boolean` | `false` | Creates a center hole in PieChart. |
| height | `number` | `280` | Chart height. |
| legend | `boolean \| "top" \| "bottom"` | `true` | Legend built from `data[].name`, same semantics as above but **on by default** because these two have always shipped a legend. Pass `false` to turn it off — required before drawing your own, otherwise two legends render side by side. |
| legendScroll | `boolean` | `false` | Same as above: keeps the legend on a single horizontally scrollable row. |
| onPointClick | `(info: { datum, index }) => void` | — | Fires when a slice is clicked (for drill-down). Hit detection is per sector; clicks on empty space do not fire. |
| className | `string` | — | Custom class name. |

### ChartReferenceLine

| Name | Type | Default | Description |
|------|------|------|------|
| y* | `number` | — | Position on the value axis. |
| label | `string` | — | Text drawn on the line ("80%", "Target"). |
| axis | `"left" \| "right"` | `"left"` | Which value axis to attach to; only meaningful on ComposedChart. |
| color | `string` | `--color-muted-foreground` | Line color. The default deliberately avoids `chart-N`: a reference line is not data, and borrowing a series hue makes it read as "series N". |
| dash | `string` | `"4 4"` | Dash pattern; pass an empty string for a solid line. |

## Examples
```tsx
// Multi-series charts should expose a legend so each line is identifiable.
const data = [{ month: "Jan", revenue: 42, orders: 168 }, { month: "Feb", revenue: 55, orders: 142 }];
<AreaChart data={data} series={[{ key: "revenue", label: "Revenue" }, { key: "orders", label: "Orders" }]} xKey="month" legend className="w-[32rem]" />

// Donut chart
<PieChart donut data={[{ name: "Search", value: 420 }, { name: "Direct", value: 280 }]} className="w-[32rem]" />

// Multi-series radar: keep the legend on one scrollable row and drop the radius-axis
// ticks, which otherwise sit on top of the data polygons (see Pitfalls).
<RadarChart legendScroll radiusAxis={false} data={data} series={series28} xKey="indicator" height={320} />

// Horizontal bars with adaptive category width
<BarChart
  horizontal
  data={[{ stage: "Audio decode", p50: 105 }, { stage: "First TTS audio", p50: 760 }]}
  xKey="stage"
  series={[{ key: "p50" }]}
/>
```

### Two units: bars and a line on separate axes

Use `ComposedChart` when one category axis carries both bars and a line, each reading its own Y axis (revenue in hundreds of thousands, orders in hundreds):

```tsx
<ComposedChart
  data={data}
  xKey="month"
  series={[
    { key: "revenue", label: "Revenue", type: "bar" },
    { key: "orders", label: "Orders", type: "line", axis: "right" },
  ]}
  leftAxisLabel="Revenue"
  rightAxisLabel="Orders"
  legend
/>
```

A Pareto chart is exactly "bars + a cumulative-share line + 80/95 reference lines":

```tsx
<ComposedChart
  data={pareto}
  xKey="sku"
  series={[
    { key: "amount", label: "Revenue", type: "bar" },
    { key: "cumulative", label: "Cumulative share", type: "line", axis: "right" },
  ]}
  referenceLines={[
    { y: 80, label: "80%", axis: "right" },
    { y: 95, label: "95%", axis: "right" },
  ]}
/>
```

`stacked` only applies **within the same axis and the same mark type**: the two axes carry different units, so adding them produces a meaningless number, and stack groups are therefore kept separate per axis.

### Click to drill down

```tsx
<BarChart
  data={daily}
  series={[{ key: "count", label: "Orders" }]}
  xKey="date"
  onPointClick={({ datum }) => openDetail(datum.date)}
/>
```

The component emits the event and nothing else: navigation, drawers, and query parameters stay in application code. Pie charts take the same prop with a `{ datum, index }` payload — a slice *is* a data point, so there is no series to report.

### Radars with mismatched units

With five axes covering revenue (hundreds of thousands), orders (hundreds), and return rate (0–100), a single scale flattens the small-unit axes into a dot near the center — the chart is still there, the shape comparison is not. Configure the full scale per axis with `axisMax`:

```tsx
<RadarChart
  data={dims}
  xKey="dim"
  series={[{ key: "storeA", label: "Store A" }, { key: "storeB", label: "Store B" }]}
  axisMax={{ Revenue: 500000, Orders: 800, "Avg order": 600, Members: 4000, "Return rate": 100 }}
/>
```

**The tooltip still shows the original values.** Normalizing the data yourself before passing it in produces the same shape, but then the tooltip only carries normalized numbers and the reader has to convert back.

An axis missing from `axisMax` falls back to "the largest value that axis has in the current data" and logs a development warning: mixing normalized and non-normalized axes is the worst outcome, because that axis silently hugs the center or pins to the outer ring. Enabling `axisMax` also turns the radius-axis ticks off by default (0–100 normalized ticks carry no meaning); pass `radiusAxis` explicitly to bring them back.

## Pitfalls
- Width comes from the parent or className, but height must be nonzero; the default is 280.
- ResponsiveContainer may measure zero inside shrinking flex layouts. Give the container explicit width; see [[recharts-responsive-container-needs-explicit-width-in-shrink-flex]].
- Headless screenshots can starve the entrance-animation clip path and show only axes. Enable reduced motion before capture; see [[recharts-headless-screenshot-blank-clippath-animation-starved]].
- Adaptive horizontal category width caps at 160 px. Shorten very long labels or pass `yAxisWidth` explicitly.
- `height` remains the component's total height when `legend` is enabled. The legend consumes a row and reduces the canvas height rather than increasing the total height. Once there are enough series to wrap, the legend stacks into several rows and keeps eating the canvas — **do not try to absorb that by raising `height`** (a 28-series legend is five rows; restoring a readable radar would mean doubling the total height). Enable `legendScroll` to keep the legend on one scrollable row.
- For the polar three (Pie/Radar/Radial), `legend` **defaults to `true`**, the opposite of the Cartesian three, because they have always shipped a legend and flipping the default would break existing layouts. Set `legend={false}` before drawing your own, or two legends render side by side.
- When drawing a custom legend, use `<Dot color={...} />`, not `<Dot style={{ color }} />`. Dot uses a background color, so the latter silently leaves it gray; see [Dot pitfalls](../dot/dot.md).
- RadarChart's radius-axis ticks (`radiusAxis`, on by default) are drawn **inside the plot area, not outside it**: the tick anchors spread along a horizontal radius running from the center of the radar to its edge, and recharts rotates each number 90° so it reads vertically. With many series or densely filled data, the first few ticks land entirely inside the data polygons — covering the shape and hard to read at the same time. **You cannot tell you picked wrong by looking at the layout**: the chart renders fine, it is just muddled. For multi-series radars prefer `radiusAxis={false}`; a radar is read as a shape comparison, and exact values are available from the tooltip.

## Related
[Stat](../stat/stat.md) · [Statistic](../statistic/statistic.md) · [Meter](../meter/meter.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
