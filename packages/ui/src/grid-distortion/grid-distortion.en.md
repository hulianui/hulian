---
slug: grid-distortion
name: GridDistortion
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [GridDistortion]
status: enriched
---

# GridDistortion

> Grid distortion · Pointer velocity drives ripples through a data-texture displacement field, then relaxation eases the mesh home · OGL/WebGL with a procedural token-colored grid and a static reduced-motion fallback · decoration/backdrop · #animated #webgl

## When to Use

Use it for an interactive hero or landing-page grid that ripples as the pointer moves. Use [GridPattern](../grid-pattern/grid-pattern.md) for static geometry, [RetroGrid](../retro-grid/retro-grid.md) for a perspective horizon, or [Spotlight](../spotlight/spotlight.md) for a pointer focus without deformation. GridDistortion can also apply the same velocity-driven displacement and relaxation to a supplied image.

## Import
```ts
import { GridDistortion } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| grid | `number` | `15` | Number of displacement cells per side; JavaScript updates `grid²` cells per frame, with 8–30 recommended |
| mouse | `number` | `0.1` | Pointer influence radius relative to the grid; range = `grid × mouse` |
| strength | `number` | `0.15` | Displacement multiplier applied to pointer velocity; higher values produce stronger ripples |
| relaxation | `number` | `0.9` | Per-frame decay from 0 to 1; values closer to 1 make ripples persist longer |
| imageSrc | `string` | — | Image to distort. When omitted, a grid texture is generated from chart tokens (recommended). Supplied images must be same-origin or CORS-enabled. |
| color | `string` | `--color-chart-1` | Main procedural-grid color used when `imageSrc` is omitted; accepts any CSS color |
| className | `string` | — | Root container (or div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Static non-WebGL content for SSR, reduced motion, or unavailable WebGL; defaults to a shaded grid |

## Examples
```tsx
// Procedural grid that distorts as the pointer moves
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <GridDistortion />
</div>
```
```tsx
// Dense grid with strong distortion
<GridDistortion grid={24} strength={0.3} mouse={0.18} />
```

## Usage Guidelines

- Render the OGL/WebGL effect inside a `"use client"` boundary. SSR and unavailable WebGL render static mesh shading.
- JavaScript performs O(`grid²`) work per frame. Values above 30 noticeably increase CPU cost.
- External `imageSrc` assets must be same-origin or CORS-enabled, or the WebGL texture becomes tainted and cannot be read.
- Place the root in a `relative overflow-hidden` container with an explicit height such as `h-64`. Distortion depends on pointer events and remains static on touch-only devices.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
