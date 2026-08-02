---
slug: sparkline
name: Sparkline
category: data-display
group: info
tags: []
exports: [Sparkline, normalize, linePath, areaPath, barRects]
status: enriched
---

# Sparkline

> Inline trend chart · axis-free line, area, or bars with optional final-point highlight, native SVG title tooltips, RSC safety, and exported geometry helpers · data-display/info

## When to use

Use Sparkline for a compact trend inside a table cell, KPI card, or list row. Use Chart when axes, legends, and interactive tooltips are required, or [Stat]/[Badge] for a single value.

## Import
```ts
import { Sparkline, normalize, linePath, areaPath, barRects } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| data* | `SparkDatum[]` | — | Numbers or `{x,y}` points, using each y value. |
| variant | `"line" \| "area" \| "bar"` | `"line"` | Rendering mode. |
| width | `number` | `80` | Viewport width. |
| height | `number` | `24` | Viewport height. |
| tone | `string` | `var(--color-primary)` | Semantic tone, CSS color, or CSS variable for stroke and fill. |
| highlightLast | `boolean` | `false` | Draws a marker on the final point. |
| min | `number` | — | Explicit normalization lower bound. |
| max | `number` | — | Explicit normalization upper bound. |
| className | `string` | — | Root class name. |

Inherits `SVGProps<SVGSVGElement>` except `data`.

## Slots

| Slot | Type | Description |
|------|------|------|
| renderTooltip | `(value: number, index: number) => ReactNode` | Produces an SVG `<title>` for each point. |

## Examples
```tsx
<Sparkline
  data={[8, 9, 7, 11, 10, 13, 12, 15]}
  variant="line"
  tone="var(--color-primary)"
  highlightLast
  width={96}
  height={22}
  renderTooltip={(v, i) => `Period ${i + 1}: ${v}`}
/>

<Sparkline data={series} variant="area" tone="chart-2" width={140} height={36} />
```

## Usage notes

- Semantic names such as `"primary"` and `"chart-2"` are resolved to tokens. Handwritten SVG variables need the `--color-` prefix; see [[hulian-token-color-var-needs-color-prefix]].
- Native `<title>` tooltips have browser-controlled delay and styling, trading customization for zero client JavaScript and RSC safety.

## Related
[ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md) · [Dot](../dot/dot.md)
