---
slug: galaxy
name: Galaxy
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Galaxy]
status: enriched
---

# Galaxy

> Parallax Galaxy · Programmatically generated multi-layer parallax galaxy WebGL background · Hash dot + cross glow + HSV color correction + triangle wave flicker + rotation/pointer repulsion, 4 layers of scale superimposed deep space depth (ogl·lazy loading·StrictMode safety·reduced-motion downgrade chart token radial gradient) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a deep sky/starry/technological depth background (hero, startup page, large data screen). If you want liquid metal fluid, use [Ferrofluid](../ferrofluid/ferrofluid.md); if you want pure dot matrix shading (non-gleaming stars), use [DotPattern](../dot-pattern/dot-pattern.md); if you want pointer focus, not stars, use [Spotlight](../spotlight/spotlight.md). This component focuses on the "cosmic" texture of multi-layered parallax + star flashing + pointer repulsion.

## Import
```ts
import { Galaxy } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| focal | `[number, number]` | `[0.5, 0.5]` | Starry sky focusing point (normalized), galaxy divergence center |
| rotation | `[number, number]` | `[1, 0]` | Viewing rotation (cos/sin vector), `[0.707,0.707]`≈45° |
| starSpeed | `number` | `0.5` | Star point drift speed factor |
| density | `number` | `1` | Star point density, 0.5 sparse, 2 stars |
| hueShift | `number` | `140` | Hue offset (0–360), default is cyan |
| speed | `number` | `1` | Total animation speed magnification (drift + flicker) |
| mouseInteraction | `boolean` | `true` | Enables galaxy offset or repulsion on pointer movement |
| glowIntensity | `number` | `0.3` | Star point glow intensity |
| saturation | `number` | `0` | Saturation, 0=close to white star; increase it with hueShift to produce color |
| mouseRepulsion | `boolean` | `true` | Pushes stars away when true or translates the whole field when false; requires `mouseInteraction` |
| repulsionStrength | `number` | `2` | Pointer repulsion strength, only effective when `mouseRepulsion=true` |
| twinkleIntensity | `number` | `0.3` | Star point flashing intensity, 0=no flashing |
| rotationSpeed | `number` | `0.1` | Galaxy automatic rotation speed, 0 = no rotation |
| autoCenterRepulsion | `number` | `0` | Center automatic repulsion, >0 to form a "star ring" in the center of the cavity |
| transparent | `boolean` | `true` | true=alpha can stack the background color with the brightness transition; false=solid black background and deep space |
| className | `string` | — | Root container (or div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL (default radial gradient div) |

## Examples
```tsx
// Default: Blue Galaxy, pointer repulsion interaction
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 265)" }}>
  <Galaxy />
</div>
```
```tsx
// Center star ring + warm purple tone
<Galaxy autoCenterRepulsion={2} density={1.2} hueShift={200} pointerInteraction={false} />
```

## Usage Guidelines

- OGL/WebGL client-side rendering (lazy loading, StrictMode safety): placed within the `"use client"` boundary; SSR / no WebGL only produces radial gradient fallback.
- The root needs to be placed into the `relative overflow-hidden` positioning container and has its own height (such as `h-64`).
- `transparent={true}` itself does not have a black base, and the container needs to be painted in a dark color to create a sense of deep space; for the classic pure black deep space `transparent={false}`.
- `pointerRepulsion` / `repulsionStrength` is only valid for `pointerInteraction=true`.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
