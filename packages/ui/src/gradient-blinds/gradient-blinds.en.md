---
slug: gradient-blinds
name: GradientBlinds
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [GradientBlinds]
status: enriched
---

# GradientBlinds

> Gradient blinds · WebGL background · Multi-color station horizontal gradient + vertical strip shading modulation + pointer-following spotlight + grain noise (rotatable/mirror/distorted) · Default chart token (ogl·reduced-motion static blind degradation) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a colorful gradient background (hero, marketing block, card base) with vertical louver texture + pointer spotlight. If you want pure stripe light without gradient, use [StripedPattern](../striped-pattern/striped-pattern.md); if you want pure pointer light without louvers, use [Spotlight](../spotlight/spotlight.md); if you want liquid fluid, use [Ferrofluid](../ferrofluid/ferrofluid.md). This component combines gradient + blinds + spotlight.

## Import
```ts
import { GradientBlinds } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| gradientColors | `string[]` | `--color-chart-1/3` | Gradient color station, horizontal interpolation, up to the first 8; any CSS color |
| angle | `number` | `0` | Ribbon rotation angle (degrees), only converts gradients and louver textures but not containers |
| noise | `number` | `0.3` | Particle noise intensity, 0=pure, recommended 0–1 |
| blindCount | `number` | `16` | The number of vertical blinds, whichever is smaller than blindMinWidth |
| blindMinWidth | `number` | `60` | The minimum width of a single bar (px), narrow containers will converge to the number of bars according to this; pass 0/negative value to close the constraint |
| mouseDampening | `number` | `0.15` | Spotlight-following damping in seconds; 0 follows immediately |
| mirrorGradient | `boolean` | `false` | The midpoint of the ribbon is folded in half to form a symmetrical round trip |
| spotlightRadius | `number` | `0.5` | Spotlight radius (normalized), minimum clamp 1e-4 |
| spotlightSoftness | `number` | `1` | Spotlight attenuation index, the larger the index, the sharper the edge |
| spotlightOpacity | `number` | `1` | Spotlight intensity, 0=no spotlight |
| distortAmount | `number` | `0` | Gradient distortion amplitude, the larger the ribbon, the more wavy it is |
| shineDirection | `"left" \| "right"` | `"left"` | Highlight scanning direction, "right" flips the light and dark tendency of each louver |
| dpr | `number` | `min(dpr, 2)` | Device pixel ratio upper limit |
| className | `string` | — | Root container div |
| style | `CSSProperties` | — | Root container inline style, such as `mixBlendMode` |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL (default static blind div) |

## Examples
```tsx
//Default: chart token two-color + pointer spotlight
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <GradientBlinds />
</div>
```
```tsx
// Diagonal multi-color station + high number of bars
<GradientBlinds
  gradientColors={["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-4)"]}
  angle={30}
  blindCount={24}
/>
```

## Usage Guidelines

- Render the OGL/WebGL effect inside a `"use client"` boundary. SSR and unavailable WebGL render the static-blinds fallback.
- `blindCount` is not an exact strip count in a narrow container because `blindMinWidth` also constrains layout. Set `blindMinWidth={0}` when the count must be exact.
- Place the root in a `relative overflow-hidden` container with an explicit height.
- Spotlight tracking depends on pointer events and becomes a static ribbon on touch-only or pointerless devices.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
