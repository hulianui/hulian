---
slug: treemap
name: Treemap
category: data-display
group: collection
tags: []
exports: [Treemap, treemapLabelFit]
status: enriched
---

# Treemap

> Treemap · A flat dataset tiled into a rectangle with area proportional to value, so the biggest contributors are obvious at a glance · recharts squarify engine with a Hulian chart-token skin · in-cell labels are dropped when the cell is too small (treemapLabelFit is a unit-tested pure function) + onItemClick drill-down + valueFormat shared by cells and tooltip · single level, no nesting · data-display/collection

## When to use

Use a treemap when a set of comparable items should be read as a **distribution**: 50 stores by member count, channels by revenue, error types by occurrence. The reader wants to see who dominates, not to read exact numbers.

When adjacent items must be compared precisely, or the list is meant to be read in order, use [BarChart](../chart/chart.md) with `horizontal` — area differences between neighboring cells cannot be judged accurately. For three to five items where "these add up to 100%" is the message, use [PieChart](../chart/chart.md).

## Import
```ts
import { Treemap } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| data* | `TreemapDatum[]` | — | Flat, single-level data `{ name, value, color? }`; area is allocated by each `value` as a share of the total. |
| height | `number` | `280` | Total component height (SSR-safe: width comes from ResponsiveContainer, height must be explicit). |
| showValue | `boolean` | `false` | Whether to add a value line under the name inside each cell. |
| valueFormat | `(value: number) => string` | `String` | Value formatting, applied to **both the in-cell text and the tooltip** so the two cannot drift apart. |
| onItemClick | `(info: { datum, index }) => void` | — | Fires when a cell is clicked (drill-down: click a store to open its member list). Only cells fire; clicks on empty space do not. |
| className | `string` | — | Custom class name, commonly used for width. |

### TreemapDatum

| Name | Type | Default | Description |
|------|------|------|------|
| name* | `string` | — | Label drawn in the cell and used as the tooltip title. |
| value* | `number` | — | The value that determines the area. |
| color | `string` | `chart-N` by index | Cell color; accepts a semantic tone name (`"success"`) or any CSS color. |

## Example
```tsx
<Treemap
  data={[
    { name: "Hangzhou Hubin", value: 3820 },
    { name: "Shanghai West Nanjing Rd", value: 3140 },
    { name: "Suzhou Guanqian", value: 2470 },
  ]}
  showValue
  valueFormat={(v) => `${(v / 1000).toFixed(1)}k`}
  onItemClick={({ datum }) => router.push(`/members?store=${datum.name}`)}
/>
```

## Pitfalls

- **Labels disappear on long-tail cells by design, not by accident.** Cell size follows the data, so the small share of items is inevitably too small to fit any text. Drawing it anyway produces a mat of overlapping fragments — SVG `text` is not clipped by its `rect`, so overflow paints straight over neighboring cells. The rule lives in the pure function `treemapLabelFit` and asks whether width *and* height still fit after padding. To let readers identify long-tail items, rely on the tooltip or pair the chart with a list; do not count on in-cell text.
- **No nested drill-down.** A single level is the whole feature: `data` does not accept `children`. Multi-level treemap interaction (descend, breadcrumb back) is a different component's worth of behavior, and in practice "drill down" means "navigate to another page" — which `onItemClick` hands to application code.
- In-cell text is fixed white rather than `foreground`: cells are filled with `chart-N` at varying lightness, so following the theme foreground would render light gray on a light cell. This matches how pie slice labels are handled.
- Beyond roughly 60 items a treemap degrades into confetti. That is the point to change the aggregation (top 20 plus "Other"), not to keep adding cells.

## Related
[Chart](../chart/chart.md) · [Heatmap](../heatmap/heatmap.md) · [Funnel](../funnel/funnel.md) · [Sankey](../sankey/sankey.md)
