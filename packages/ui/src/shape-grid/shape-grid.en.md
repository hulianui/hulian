---
slug: shape-grid
name: ShapeGrid
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [ShapeGrid]
status: enriched
---

# ShapeGrid

> Infinite geometric grid · Canvas 2D squares, circles, triangles, or hexagons pan continuously + pointer fill easing and optional fading trail (zero dependencies · token colors · reduced-motion static state · jsdom-safe) · decoration/backdrop · #animated

## When to Use

Use it for a continuously panning geometric-cell background with pointer highlights, such as a kanban or landing-page surface. For a static dot pattern, use [DotPattern](../dot-pattern/dot-pattern.md); for a static line grid, use [GridPattern](../grid-pattern/grid-pattern.md). ShapeGrid uses Canvas 2D rather than WebGL and supports four cell shapes plus optional hover trails.

## Import
```ts
import { ShapeGrid } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| direction | `"right"\|"left"\|"up"\|"down"\|"diagonal"` | `"right"` | Grid scroll direction |
| speed | `number` | `1` | Scrolling speed (pixels/frame, internal clamp lower limit 0.1); forced stillness under reduced-motion |
| borderColor | `string` | `var(--color-border)` | Cell edge color, any CSS color string |
| squareSize | `number` | `40` | Unit side length (px), also determines the mesh density |
| hoverFillColor | `string` | `var(--color-primary)` | Cell fill color on hover, fade in/out easing |
| shape | `"square"\|"circle"\|"triangle"\|"hexagon"` | `"square"` | Element shape |
| hoverTrailAmount | `number` | `0` | Hover trailing length (how many historical units are retained to fade out), 0 = no trailing |
| className | `string` | — | Passthrough to root canvas |
| style | `CSSProperties` | — | Inline styles passed through to the root canvas |

## Examples
```tsx
// Default rightward grid using the border token.
<div className="relative h-56 overflow-hidden rounded-xl">
  <ShapeGrid className="absolute inset-0 opacity-90" />
</div>

// Dot matrix · Scroll up · Hover tail + chart-2 fill
<ShapeGrid
  shape="circle"
  direction="up"
  hoverTrailAmount={6}
  hoverFillColor="var(--color-chart-2)"
  className="absolute inset-0 opacity-90"
/>
```

## Usage Guidelines

- It is a canvas itself and does not have `absolute inset-0`. It must be filled with className positioning (`absolute inset-0` in the example); the parent container must have positioning + size + `overflow-hidden`.
- The color token fed to the canvas must be prefixed with `--color-` (such as `var(--color-chart-2)`). If bare `var(--primary)` is not parsed, see [[hulian-token-color-var-needs-color-prefix]].
- In reduced-motion, the speed is treated as 0 (still), and the motion effect should not be used as key feedback.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
