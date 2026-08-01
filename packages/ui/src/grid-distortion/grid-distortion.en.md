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

> Mesh distortion · Liquid mesh distortion for pointer drag WebGL background · Data texture displacement field + pointer speed ripple/relaxation rebound (ogl · zero external resources default procedural mesh shading · token shading · reduced-motion degradation) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a strong interactive grid background (hero, interactive landing page) where the liquid ripples are distorted when the pointer is moved over it. If you want a static geometric grid, use [GridPattern](../grid-pattern/grid-pattern.md); if you want a retro perspective grid horizon, use [RetroGrid](../retro-grid/retro-grid.md); if you want pointer focus without distortion, use [Spotlight](../spotlight/spotlight.md). The core of the interaction of this component is the displacement ripple + relaxation rebound driven by pointer speed, which can also distort the incoming image.

## Import
```ts
import { GridDistortion } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| grid | `number` | `15` | Displacement grid side length (number of grids), JS iterates grid² per frame, recommended 8–30 |
| mouse | `number` | `0.1` | Pointer influence radius relative to the grid; range = `grid × mouse` |
| strength | `number` | `0.15` | Displacement intensity, pointer speed × This coefficient is written into the displacement field. The larger the ripples, the more severe the ripples will be. |
| relaxation | `number` | `0.9` | Relaxation coefficient (attenuation per frame, 0–1), the closer to 1, the longer the aftertaste |
| imageSrc | `string` | — | Image to distort. When omitted, a grid texture is generated from chart tokens (recommended). Supplied images must be same-origin or CORS-enabled. |
| color | `string` | `--color-chart-1` | Grid shading main color (only effective when imageSrc is not passed), any CSS color |
| className | `string` | — | Root container (or div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL (default grid-shaded div) |

## Examples
```tsx
//Default: Programmed grid shading, distortion when the pointer moves over it
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <GridDistortion />
</div>
```
```tsx
// high density + strong distortion
<GridDistortion grid={24} strength={0.3} pointer={0.18} />
```

## Usage Guidelines

- Render the OGL/WebGL effect inside a `"use client"` boundary. SSR and unavailable WebGL render static mesh shading.
- JavaScript performs O(`grid²`) work per frame. Values above 30 noticeably increase CPU cost.
- External `imageSrc` assets must be same-origin or CORS-enabled, or the WebGL texture becomes tainted and cannot be read.
- Place the root in a `relative overflow-hidden` container with an explicit height such as `h-64`. Distortion depends on pointer events and remains static on touch-only devices.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
