---
slug: flickering-grid
name: FlickeringGrid
category: decoration
group: backdrop
tags: [animated]
exports: [FlickeringGrid]
status: enriched
---

# FlickeringGrid

> Flickering grid · Canvas pixel grid randomly illuminates and disappears + ResizeObserver adaptive + Color eating theme token (frame by frame) · decoration/backdrop · #animated

## When to Use

Use it when you need a pixel grid background with a sense of technology/data, and the grid randomly flashes on and off. Based on Canvas, it comes with a ResizeObserver that follows the container size; if you want a static regular grid (no flickering, lighter), use [GridPattern](../grid-pattern/grid-pattern.md); if you want a dot matrix, use [DotPattern](../dot-pattern/dot-pattern.md); if you want a retro perspective grid, use [RetroGrid](../retro-grid/retro-grid.md).

## Import
```ts
import { FlickeringGrid } from "@hulianui/ui"
```

## Props

Inherits `HTMLAttributes<HTMLDivElement>`, additionally:

| Name | Type | Default | Description |
|------|------|------|------|
| squareSize | number | 4 | Side length of each square (px), the smaller, the denser |
| gridGap | number | 6 | Square spacing (px) |
| flickerChance | number | 0.3 | Flash probability per frame per frame (multiplied by deltaTime). 0=static mesh, 1=high frequency flashing |
| maxOpacity | number | 0.3 | Maximum opacity of the grid (0~1), the higher the value, the more obvious |
| color | string | `--color-foreground` | Square color; accepts any CSS color. When omitted, RGB is derived from the container's `color` value or token and follows the active theme. |
| width | number | - | Fixed width (px). Do not pass ResizeObserver to follow the container width |
| height | number | - | Fixed height (px). Do not pass ResizeObserver to follow the height of the container |

## Examples
```tsx
// The default grid of the theme foreground color, covering the positioning parent container
<div className="relative h-48 overflow-hidden rounded-xl border">
  <FlickeringGrid className="absolute inset-0" />
</div>
```
```tsx
// Accent color + large square + low frequency flicker
<FlickeringGrid
  className="absolute inset-0"
  color="var(--color-primary)"
  squareSize={8}
  gridGap={4}
  flickerChance={0.1}
  maxOpacity={0.4}
/>
```

## Usage Guidelines

- Based on Canvas, client rendering is required; the parent container needs `relative` + `overflow-hidden`, and the component itself is filled with `absolute inset-0`.
- When `width` or `height` is omitted, a ResizeObserver tracks the container. Ensure the container has measurable dimensions and its height does not collapse to 0.
- `color` can pass `var(--color-*)`, and the component will getComputedStyle parsed frame by frame (different from Particles that only eat rgb), but there is a small cost for parsing each frame.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
