---
slug: world-map
name: WorldMap
category: data-display
group: stat
tags: [animated]
exports: [WorldMap]
status: enriched
---

# WorldMap

> A theme-aware dotted world map with animated geographic arcs, pulsing endpoints, value-sized nodes, click-through details, labels, and moving plane, comet, or arrow markers.

## When to use

Use WorldMap for decorative geographic connections and node distributions such as global points of presence, routing, or traffic dashboards. It is not a precise choropleth; use a GeoJSON mapping library for administrative-area statistics. Use [NumberTicker](../number-ticker/number-ticker.md) for numeric motion or [Chart](../chart/chart.md) for standard charts.

## Import
```ts
import { WorldMap } from "@hulianui/ui"
```

## Props

`WorldMapDot` is `{ start: WorldMapPoint; end: WorldMapPoint; color?: string }`; `WorldMapPoint` is `{ lat; lng; label? }`; and `WorldMapNode` is `WorldMapPoint & { id?; value?; color? }`.

| Name | Type | Default | Description |
|------|------|------|------|
| dots | `WorldMapDot[]` | - | Geographic connection pairs; omission renders only the dotted base map. |
| flyingMarker | `"plane" \| "comet" \| "arrow"` | - | Repeating marker along every arc; planes and arrows rotate with direction. |
| points | `WorldMapNode[]` | - | Independent nodes whose values map to radius within the current point range. |
| showLabels | `boolean` | `false` | Shows node labels. |
| lineColor | `string` | `"var(--color-chart-1)"` | Chart-token arc color, overridable per dot. |
| dotColor | `string` | `"var(--color-border)"` | Border-token base-map dot color. |
| duration | `number` | `1` | Arc entrance duration in seconds. |
| className | `string` | - | Container class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onPointClick | `(node: WorldMapNode, index: number) => void` | Makes nodes focusable and exposes them to assistive technology for drill-down. |

## Examples
```tsx
// Beijing to New York
<WorldMap dots={[{ start: { lat: 39.9, lng: 116.4 }, end: { lat: 40.7, lng: -74 } }]} />

// Clickable node distribution
<WorldMap
  points={[
    { id: "sh", lat: 31.2, lng: 121.5, label: "Shanghai", value: 92 },
    { id: "sg", lat: 1.35, lng: 103.8, label: "Singapore", value: 64 },
  ]}
  showLabels
  onPointClick={(node) => console.log("Drill down", node.label)}
/>

// Moving plane markers
<WorldMap dots={dots} flyingMarker="plane" />
```

## Pitfalls

- SVG colors must use full `--color-` tokens such as `var(--color-chart-1)`; bare `var(--chart-1)` may resolve black or transparent in Tailwind v4. See [[hulian-token-color-var-needs-color-prefix]].
- Arc and endpoint animations can be at their initial frame in headless screenshots. Use a real browser or reduced motion; see [[verify-sub-second-web-animation-via-headless-screenshot]] and [[recharts-headless-screenshot-blank-clippath-animation-starved]].
- Without `onPointClick`, the SVG is decorative and `aria-hidden`. Supplying it makes nodes keyboard reachable. Unlabeled interactive nodes use the runtime fallback `` `\u8282\u70b9 ${index + 1}` `` ("Node N").

## Related
[Stat](../stat/stat.md) · [Statistic](../statistic/statistic.md) · [Chart](../chart/chart.md) · [Meter](../meter/meter.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md)
