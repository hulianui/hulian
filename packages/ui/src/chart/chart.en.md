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

> Theme-token wrappers around Recharts area, bar, line, pie, donut, radar, and radial charts.

## When to use

Use Chart for complete dashboard trends, distributions, and comparisons with one or more series. Use [Stat](../stat/stat.md) or [Statistic](../statistic/statistic.md) for one KPI and Sparkline for a lightweight inline trend.

## Import
```ts
import { AreaChart, BarChart, LineChart, PieChart, RadarChart, RadialChart, chartColor } from "@hulianui/ui"
```

## Props

### AreaChart / BarChart / LineChart / RadarChart (Cartesian)

| Name | Type | Default | Description |
|------|------|------|------|
| data* | `TDatum[]` | — | Row data. |
| series* | `ChartSeries[]` | — | `{ key, label?, color? }`; colors default by index to chart tokens. |
| xKey* | `string` | — | Horizontal-axis field. |
| height | `number` | `280` | Explicit SSR-safe height. |
| stacked | `boolean` | `false` | Stacks AreaChart or BarChart series. |
| horizontal | `boolean` | `false` | BarChart-only horizontal orientation. |
| yAxisWidth | `number` | Adaptive | BarChart-only category-axis width; horizontal mode estimates 48-160 px through `categoryAxisWidth`. |
| className | `string` | — | Custom class, commonly used for width. |

### PieChart / RadialChart (flat data)

| Name | Type | Default | Description |
|------|------|------|------|
| data* | `ChartDatum[]` | — | Flat `{ name, value, color? }` data. |
| donut | `boolean` | `false` | Creates a center hole in PieChart. |
| height | `number` | `280` | Chart height. |
| className | `string` | — | Custom class name. |

## Examples
```tsx
// Multi-series area chart using chart tokens
const data = [{ month: "Jan", revenue: 42, orders: 168 }, { month: "Feb", revenue: 55, orders: 142 }];
<AreaChart data={data} series={[{ key: "revenue", label: "Revenue" }, { key: "orders", label: "Orders" }]} xKey="month" className="w-[32rem]" />

// Donut chart
<PieChart donut data={[{ name: "Search", value: 420 }, { name: "Direct", value: 280 }]} className="w-[32rem]" />

// Horizontal bars with adaptive category width
<BarChart
  horizontal
  data={[{ stage: "Audio decode", p50: 105 }, { stage: "First TTS audio", p50: 760 }]}
  xKey="stage"
  series={[{ key: "p50" }]}
/>
```

## Pitfalls
- Width comes from the parent or className, but height must be nonzero; the default is 280.
- ResponsiveContainer may measure zero inside shrinking flex layouts. Give the container explicit width; see [[recharts-responsive-container-needs-explicit-width-in-shrink-flex]].
- Headless screenshots can starve the entrance-animation clip path and show only axes. Enable reduced motion before capture; see [[recharts-headless-screenshot-blank-clippath-animation-starved]].
- Adaptive horizontal category width caps at 160 px. Shorten very long labels or pass `yAxisWidth` explicitly.

## Related
[Stat](../stat/stat.md) · [Statistic](../statistic/statistic.md) · [Meter](../meter/meter.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
