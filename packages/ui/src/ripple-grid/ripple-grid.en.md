---
slug: ripple-grid
name: RippleGrid
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [RippleGrid]
status: enriched
---

# RippleGrid

> Ripple grid · WebGL background · Concentric sine-wave displacement + vignette/glow/rainbow modes + local pointer ripple (ogl · chart token · reduced-motion static fallback) · decoration/backdrop · #animated #webgl

## When to Use

Want an organic dynamic texture (hero / card background) where the grid is pushed and undulated by ripples. To statically regularize the grid, use [GridPattern](../grid-pattern/grid-pattern.md); to use the perspective retreat grid, use [RetroGrid](../retro-grid/retro-grid.md); RippleGrid is the only one in this family that allows the grid to twist with concentric ripples + pointer ripples, and supports rainbow cycle color matching.

## Import
```ts
import { RippleGrid } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| enableRainbow | `boolean` | `false` | Rainbow cycle color matching (gradient between RGB over time, ignore color) |
| color | `string` | `var(--color-chart-1)` | Grid main color, any CSS color string; ignored when enableRainbow=true |
| rippleIntensity | `number` | `0.05` | Ripple perturbation intensity, 0 = stationary grid |
| gridSize | `number` | `10` | Grid density, the larger the density, the denser it is |
| gridThickness | `number` | `15` | Inverse line-thickness control; higher values produce thinner, sharper lines |
| fadeDistance | `number` | `1.5` | The distance from the center to the surroundings fades out exponentially. The larger the distance, the more focused the center is. |
| vignetteStrength | `number` | `2` | Vignette strength, 0 = no vignetting |
| glowIntensity | `number` | `0.1` | Grid line luminous intensity, 0 = no glow |
| opacity | `number` | `1` | Overall opacity (0–1) |
| gridRotation | `number` | `0` | Grid rotation angle (degrees), 45 = diamond grid |
| mouseInteraction | `boolean` | `true` | An extra circle of ripples is caused at the pointer |
| mouseInteractionRadius | `number` | `1` | Mouse ripple influence radius |
| className | `string` | — | Passthrough to the root container (or fallback div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL (default static mesh shading div) |

## Examples
```tsx
//Default: dark background + chart-1 token, automatic light and dark adaptation
<div className="relative h-64 overflow-hidden rounded-xl">
  <RippleGrid />
</div>

// Rainbow cycle color + slightly stronger ripples
<RippleGrid enableRainbow rippleIntensity={0.08} gridSize={12} />
```

## Usage Guidelines

- Requires client-side rendering (WebGL/ogl), the component comes with `"use client"`; client subtree or dynamic import is installed in the RSC page.
- The component comes with `absolute inset-0 z-0`, and the parent container must have positioning + size + `overflow-hidden`, otherwise it will not be visible.
- `enableRainbow` will ignore `color`, don't count on both at the same time; if you want a single theme color, turn off the rainbow.
- Under reduced motion or without WebGL, the component renders the static grid fallback. Do not use motion as the only carrier of information.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
