---
slug: heatmap
name: Heatmap
category: data-display
group: collection
tags: []
exports: [Heatmap, buildMatrix, bucketize]
status: enriched
---

# Heatmap

> A grid heatmap with configurable domains, color buckets, legends, labels, empty-cell treatment, tooltips, and click-through details.

## When to use

Use Heatmap to expand sparse `{x, y, value}` points into a two-dimensional intensity grid, such as contribution activity, module-by-time hotspots, coverage, or mastery matrices. Use [Table](../table/table.md) or [ProTable](../pro-table/pro-table.md) when cells need rich content, sorting, or pagination.

## Import
```ts
import { Heatmap, buildMatrix, bucketize } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| data* | `HeatCell[]` | — | Sparse `{x, y, value}` points. |
| xLabels | `(string｜number)[]` | Derived from data | Explicit column labels. |
| yLabels | `(string｜number)[]` | Derived from data | Explicit row labels. |
| colorScale | `number` | `5` | Number of color levels. |
| max | `number` | Data maximum | Full-scale value; `domain` takes precedence when supplied. |
| domain | `[number, number]` | `[0, max]` | Explicit value range used to bucket `(value-min)/(max-min)`; values at or below min use level zero. |
| valueFormat | `(value: number) => string` | `String` | Formats tooltip and legend values and takes precedence over `unit`. |
| unit | `string` | — | Suffix appended to raw values; use `valueFormat` for numeric conversion. |
| emptyCellTone | `string` | — | CSS background for absent points. Without it, absent cells share the zero-level color. |
| showLegend | `boolean` | `false` | Shows range labels, color blocks, and an absent-data sample when `emptyCellTone` is set. |
| cellSize | `number` | `14` | Cell side length in pixels. |
| gap | `number` | `3` | Gap between cells in pixels. |
| showLabels | `boolean` | `true` | Shows row and column labels. |
| formatTooltip | `(cell: HeatmapCellInfo) => string` | — | Formats the native hover title. Check `cell.empty` before using its zero fallback value. |
| className | `string` | — | Custom class name. |

`HeatmapCellInfo`, passed to `formatTooltip` and `onCellClick`:

| Field | Type | Description |
|------|------|------|
| x / y | `string｜number` | Column and row labels. |
| value | `number` | Cell value; absent cells use `0`, so this does not indicate presence. |
| empty | `boolean` | Whether the point is absent from `data`; the optional typing preserves compatibility. |

## Events

| Event | Type | Description |
|------|------|------|
| onCellClick | `(cell: HeatmapCellInfo) => void` | Fires when a cell is selected for drill-down. |

## Examples
```tsx
const data = MODULES.flatMap((module, moduleIndex) =>
  WEEKDAYS.map((day, dayIndex) => ({ x: day, y: module, value: (moduleIndex * 7 + dayIndex * 3 + 2) % 10 })),
);

<Heatmap data={data} xLabels={WEEKDAYS} yLabels={MODULES} cellSize={18} />
```

Compact mode without labels:
```tsx
<Heatmap data={data} xLabels={WEEKDAYS} yLabels={MODULES} showLabels={false} cellSize={12} />
```

Format a decimal mastery domain as percentages:
```tsx
<Heatmap
  data={masteryData}
  domain={[0.5, 0.9]}
  valueFormat={(value) => `${Math.round(value * 100)}%`}
  showLegend
/>
```

Distinguish absent data from a real zero:
```tsx
<Heatmap
  data={masterySparse}
  domain={[0, 1]}
  valueFormat={(value) => `${Math.round(value * 100)}%`}
  emptyCellTone="repeating-linear-gradient(45deg, var(--color-border) 0 2px, transparent 2px 4px)"
  showLegend
  formatTooltip={(cell) => (cell.empty ? `${cell.y}/${cell.x}: no response` : `${cell.y}/${cell.x}: ${Math.round(cell.value * 100)}%`)}
/>
```

## Pitfalls

Use deterministic `data`; generating showcase values with `Math.random()` can make SSR and CSR color levels disagree. Set the same `max` or `domain` when comparing multiple heatmaps.

- `unit` only appends text. For a 0-1 ratio, `unit="%"` produces `0.55%`; use `valueFormat` to convert it to a percentage.
- Decimal data now defaults to its actual maximum. Pass `max={1}` if you require the earlier fixed-one behavior.
- Values at or below the domain minimum use the lightest level, so place min below the lowest meaningful data point.
- Without `emptyCellTone`, absent data and zero share a color. Set it when those states have different meanings.
- Test `cell.empty`, not `cell.value === 0`, because absent cells use zero as a compatibility fallback. Custom tooltip logic must make the same distinction. The built-in absent label is the runtime string `"\u65e0\u6570\u636e"` ("No data").
- The legend accessibility label follows the runtime template `` `\u8272\u9636\uff1a${formatValue(domainMin)} \u81f3 ${formatValue(domainMax)}` `` ("Color scale: minimum to maximum").
- `buildMatrix(...).get(y, x)` returns `undefined` for an absent point; direct consumers can use `get(y, x) ?? 0` when a numeric fallback is required.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
