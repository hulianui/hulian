---
slug: score-ring
name: ScoreRing
category: data-display
group: info
tags: []
exports: [ScoreRing, resolveGrade, DEFAULT_GRADES]
status: enriched
---

# ScoreRing

> A circular score gauge with value-to-grade mapping, configurable grade bands, and centered score and grade labels.

## When to use

Use ScoreRing to present a quality, health, or rating score as a circular gauge with automatic A-F grade coloring. Use [Meter] or [Progress] for linear progress and capacity, or [Sparkline](../sparkline/sparkline.md) for trends. Its SVG dasharray rendering is compatible with React Server Components.

## Import
```ts
import { ScoreRing, resolveGrade, DEFAULT_GRADES } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `number` | — | Current score. |
| max | `number` | `100` | Maximum score. |
| grades | `Grade[]` | — | Grade bands; omission uses `DEFAULT_GRADES` for A-F. |
| size | `number` | `96` | Diameter in pixels. |
| thickness | `number` | `8` | Ring thickness in pixels. |
| showGrade | `boolean` | `true` | Shows the grade letter. |
| className | `string` | — | Custom class name. |

## Slots

| Slot | Type | Description |
|------|------|------|
| label | `ReactNode` | Secondary center label, such as "Quality score". |

## Examples
```tsx
<ScoreRing value={95} label="Quality score" />
<ScoreRing value={42} label="Quality score" />
```

Use a compact size without the grade letter:
```tsx
<ScoreRing value={88} size={48} thickness={5} showGrade={false} />
```

## Pitfalls

`resolveGrade(value, max, grades)` determines the grade color. Pass `grades` to replace the default A-F system with your own rating model.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [Badge](../badge/badge.md) · [Dot](../dot/dot.md)
