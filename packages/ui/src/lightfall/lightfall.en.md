---
slug: lightfall
name: Lightfall
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Lightfall]
status: enriched
---

# Lightfall

> Falling light beams · WebGL tunnel background · Height-cycled beam colors + central glow + flicker/trails + pointer attraction (ogl · tokens · reduced-motion fallback) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need an atmospheric background with multi-color beams falling on a dark hero, center glow and trailing. If you want a radial beam (outward from the origin), use [LightRays](../light-rays/light-rays.md); if you want a single volumetric beam, use [LightPillar](../light-pillar/light-pillar.md); if you want a static lattice pattern, use [DotPattern](../dot-pattern/dot-pattern.md).

## Import
```ts
import { Lightfall } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | `string[]` | `["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-4)"]` | Beam color palette (cycle by height), any CSS color, up to the first 8 |
| backgroundColor | `string` | `var(--color-primary)` | Color of the central background glow |
| speed | `number` | `0.5` | Fall speed, 0 approximately stationary (still rendered) |
| streakCount | `number` | `2` | Number of simultaneous beams (rounded and clamped to 1–16) |
| streakWidth | `number` | `1` | Beam width multiplier; higher values produce thicker beams |
| streakLength | `number` | `1` | Trail-length multiplier; higher values produce longer trails |
| glow | `number` | `1` | Overall glow intensity |
| density | `number` | `0.6` | Beam angular density (number of rings), the larger the density, the denser it is |
| twinkle | `number` | `1` | Flashing intensity, 0=constantly on, 1=light and dark breathing |
| zoom | `number` | `3` | Sight distance zoom (tunnel depth perception) |
| backgroundGlow | `number` | `0.5` | Background center glow intensity, 0=off |
| opacity | `number` | `1` | Overall opacity (written to shader) |
| mouseInteraction | `boolean` | `true` | Mouse interaction (pointer highlight + pulling light group) |
| mouseStrength | `number` | `0.5` | Mouse highlight intensity |
| mouseRadius | `number` | `1` | Mouse influence radius |
| className | `string` | — | Additional class name for the root container; the component includes `absolute inset-0 z-0` |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static cover content without WebGL |

## Examples
```tsx
// The component includes absolute inset-0; provide a relative, fixed-height, clipped parent.
<div className="relative h-64 overflow-hidden rounded-xl">
  <Lightfall />
  <div className="relative z-10 flex h-full items-center justify-center">
    Lightfall
  </div>
</div>
```
```tsx
// Slow wallpaper level: long tail · no interaction
<Lightfall speed={0.25} streakCount={3} streakLength={1.8} mouseInteraction={false} />
```

## Usage Guidelines

- The component comes with `absolute inset-0 z-0`, and the content stacked on it must be `relative z-10`, otherwise it will be covered.
- ogl/WebGL client only; SSR/no WebGL fallback, reduced-motion downgrade.
- A full-screen background layer in a non-cascading context parent of an opaque background may be completely black by the parent background, see [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].
- `colors`/`backgroundColor` must use the `--color-` prefix token when passing CSS variables, see [[hulian-token-color-var-needs-color-prefix]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
