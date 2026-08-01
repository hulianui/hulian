---
slug: ferrofluid
name: Ferrofluid
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Ferrofluid]
status: enriched
---

# Ferrofluid

> Ferrofluid · Liquid metal ferrofluid WebGL background component · value-noise ridge + smin soft blend + rim bright band flow + pointer concave interaction (ogl·theme chart token·reduced-motion radial gradient pocket) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a high-end liquid metal/fluid glow background (brand hero, product page). If you want a more galactic deep space, use [Galaxy](../galaxy/galaxy.md); if you want pure geometric shading, use [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md); if you want pointer focus instead of fluid peaks and ridges, use [Spotlight](../spotlight/spotlight.md). This component focuses on the texture of "metal flow + pointer concave".

## Import
```ts
import { Ferrofluid } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | `string[]` | `--color-chart-1/2/4` | Fluid ribbon, up to 8 colors, mapped according to height gradient low → high; any CSS color |
| speed | `number` | `0.5` | Animation speed factor, the larger the value, the faster the flow |
| scale | `number` | `1.6` | Noise/texture scaling, the larger it is, the finer it is; < 0.05 clamp to the lower limit |
| turbulence | `number` | `1` | Turbulence intensity, 0 = nearly stationary smooth liquid surface |
| fluidity | `number` | `0.1` | Peak-ridge fusion flexibility, the larger it is, the more liquid-like it is, the lower limit is 0.001 |
| rimWidth | `number` | `0.2` | Highlight edge width |
| sharpness | `number` | `2.5` | Highlight gamma; higher values tighten the bright bands |
| shimmer | `number` | `1.5` | Low light disturbance intensity, creating metal flashes |
| glow | `number` | `2` | Overall glow gain, the bigger it is, the brighter it is |
| flowDirection | `"up" \| "down" \| "left" \| "right"` | `"down"` | Peak ridge overall drift direction |
| opacity | `number` | `1` | Overall opacity, range 0–1 |
| mouseInteraction | `boolean` | `true` | Lets the pointer depress the liquid field and suppress bright bands |
| mouseStrength | `number` | `1` | Pointer influence intensity, only effective when `mouseInteraction=true` |
| mouseRadius | `number` | `0.35` | Normalized pointer influence radius |
| mouseDampening | `number` | `0.15` | Pointer-following damping in seconds; 0 follows immediately |
| dpr | `number` | `min(dpr, 2)` | Upper limit of device pixel ratio, lower it to save GPU |
| className | `string` | — | Root container (or div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL (default radial gradient div) |

## Examples
```tsx
// Default: use theme chart token three colors
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 265)" }}>
  <Ferrofluid />
</div>
```
```tsx
// Wallpaper level: slow and large scale, turn off pointer interaction
<Ferrofluid speed={0.25} scale={2.4} glow={2.4} pointerInteraction={false} />
```

## Usage Guidelines

- OGL/WebGL client-side rendering: placed within the `"use client"` boundary; SSR / no WebGL only produces radial gradient fallback.
- The root needs to be placed into the `relative overflow-hidden` positioning container and has its own height.
-Only dark background can bring out the metallic fluid, while light foundation will make the layers blurry.
- High-resolution screens can explicitly transfer `dpr={1}` to save GPU; increasing `turbulence` / `shimmer` will increase the fragment overhead.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
