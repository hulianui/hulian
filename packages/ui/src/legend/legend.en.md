---
slug: legend
name: Legend
category: data-display
group: stat
tags: []
exports: [Legend]
status: enriched
---

# Legend

> A standalone dot, square, or line legend with row or column layout, chart-token colors, optional values, and controlled item toggles.

## When to use

Use Legend beside custom visuals such as Sparkline, Heatmap, [ContributionGraph](../contribution-graph/contribution-graph.md), WorldMap, Funnel, or small card graphics.

Recharts legends only exist inside a chart, and [Chart](../chart/chart.md) already includes one. This component standardizes out-of-chart marker shapes and defaults to the same `chart-1..6` token sequence.

## Import
```ts
import { Legend, type LegendItem } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `LegendItem[]` | — | `{ label, color?, value?, hidden?, id? }[]`. |
| marker | `"dot" \| "square" \| "line"` | `"dot"` | Marker shape. |
| layout | `"row" \| "column"` | `"row"` | Wrapping row or vertical column with right-aligned values. |
| size | `"sm" \| "md"` | `"md"` | Component size. |
| onItemClick | `(item, index) => void` | — | Makes each item a button when supplied. |
| className | `string` | — | Custom class and forwarded native attributes. |

### LegendItem

| Field | Type | Description |
|------|------|------|
| label* | `ReactNode` | Series name. |
| color | `string` | Semantic name or CSS color; omission uses chart tokens by index. |
| value | `ReactNode` | Value or percentage after the label. |
| hidden | `boolean` | Mutes a disabled series without removing its toggle. |
| id | `string \| number` | Stable identity returned by the click callback. |

## Examples
```tsx
// Legend for a custom Sparkline
<Legend marker="line" items={[
  { label: "This week", color: "primary", value: "1.2k" },
  { label: "Last week", color: "muted", value: "980" },
]} />

// Controlled series visibility
const [hidden, setHidden] = useState<Record<string, boolean>>({})
<Legend
  items={series.map((item) => ({ ...item, hidden: hidden[item.id] }))}
  onItemClick={(item) => setHidden((state) => ({ ...state, [item.id]: !state[item.id] }))}
/>
```

## Pitfalls

- Visibility is controlled by the caller so the legend and graphic share one source of truth.
- Keep hidden items present and muted, or users cannot toggle them back on.
- Do not duplicate the built-in Recharts legend inside [Chart](../chart/chart.md).

## Related
[Chart](../chart/chart.md) · [Sparkline](../sparkline/sparkline.md) · [ContributionGraph](../contribution-graph/contribution-graph.md) · [Heatmap](../heatmap/heatmap.md) · [Stat](../stat/stat.md)
