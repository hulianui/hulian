---
slug: score-ring
name: ScoreRing
category: data-display
group: info
tags: []
exports: [ScoreRing, resolveGrade, DEFAULT_GRADES, Grade]
status: enriched
---

# ScoreRing

> Displays a numeric score and grade inside a color-coded radial gauge.

## When to use

Use ScoreRing to present a quality, health, or rating score as a circular gauge with automatic A-F grade coloring. Use [Meter] or [Progress] for linear progress and capacity, or [Sparkline](../sparkline/sparkline.md) for trends. Its SVG dasharray rendering is compatible with React Server Components.

## Import
```ts
import { ScoreRing, resolveGrade, DEFAULT_GRADES } from "@hulianui/ui"
```

## Props

`Grade` = `{ min: number; label: string; tone?: string }`, where `min` is the **lowest score
(inclusive)** that lands in the band, `label` is the band's caption, and `tone` takes either a
semantic color name (`"success"` / `"warning"` / `"danger"` / `"chart-2"` and so on) or any CSS
color value (`#hex`, `var(--color-success)`). Both are typed `string` and both are accepted.

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `number` | - | Current score. |
| max | `number` | `100` | Maximum score. |
| grades | `Grade[]` | - | Grade bands; omission uses `DEFAULT_GRADES` for A-F. |
| size | `number` | `96` | Diameter in pixels. |
| thickness | `number` | `8` | Ring thickness in pixels. |
| showGrade | `boolean` | `true` | Shows the grade letter. |
| className | `string` | - | Custom class name. |

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

A custom rating model. `grades` needs no pre-sorting: `resolveGrade` sorts by `min` descending
and takes the first band the value reaches.
```tsx
import type { Grade } from "@hulianui/ui"

const CREDIT_GRADES: Grade[] = [
  { min: 85, label: "Excellent", tone: "success" },
  { min: 70, label: "Good", tone: "success" },
  { min: 50, label: "Fair", tone: "warning" },
  { min: 30, label: "Weak", tone: "warning" },
  { min: 0, label: "High risk", tone: "danger" },
]

<ScoreRing value={36} label="Credit score" grades={CREDIT_GRADES} />
```

## Pitfalls

- **`resolveGrade(value, grades)` determines the grade color.** It takes two arguments and
  **there is no `max`**: `max` is a prop this component uses to draw the arc, not a parameter of
  the function. Before 0.56.1 this section claimed three arguments, and following it with
  `resolveGrade(score, 100, myGrades)` passes `100` where `grades` belongs.
- **The default `DEFAULT_GRADES` has five bands but only three colors** (A/B are both success,
  C/D are both warning). Pass your own `grades` when every band needs its own color.
- **A band without `tone` falls back to the component's default color**, not to transparent.
  Give it an explicit color when a band should not be tinted.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [Badge](../badge/badge.md) · [Dot](../dot/dot.md)
