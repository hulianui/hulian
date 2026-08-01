---
slug: light-pillar
name: LightPillar
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [LightPillar]
status: enriched
---

# LightPillar

> Volumetric light column · WebGL background · Accumulated glow along the y-axis raymarch + multi-layer wave noise + top and bottom two-color vertical gradient (ogl·token adaptive·reduced-motion degradation) · decoration/backdrop · #animated #webgl

## When to Use

Used when a single top-to-bottom gradient volumetric light column is needed as the focus of the centered hero. For random flashing arcs/auroras use [Lightning](../lightning/lightning.md); for radial multiple beams use [LightRays](../light-rays/light-rays.md); for falling beams use [Lightfall](../lightfall/lightfall.md).

## Import
```ts
import { LightPillar } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| topColor | `string` | `var(--color-chart-2)` | Top color of light beam, any CSS color, default token light and dark adaptive |
| bottomColor | `string` | `var(--color-chart-1)` | The color at the bottom of the light beam, mixed with the top color along the y-axis gradient |
| intensity | `number` | `1` | Overall brightness coefficient, the larger, the brighter |
| rotationSpeed | `number` | `0.3` | Rotation speed factor, while driving time advancement, 0=almost stationary |
| glowAmount | `number` | `0.005` | Glow intensity (raymarch cumulative gain), recommended 0.001–0.02 |
| pillarWidth | `number` | `3` | Light beam thickness (world radius), the smaller it is, the finer it is like a laser |
| pillarHeight | `number` | `0.4` | Height factor; higher values make the vertical bands denser |
| noiseIntensity | `number` | `0.5` | Particle noise intensity, 0=pure and no particles |
| pillarRotation | `number` | `0` | The overall tilt angle of the light beam (degrees), example 30 = obliquely irradiated to one side |
| className | `string` | — | Canvas container (or fallback div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL, default token gradient light beam |

## Examples
```tsx
//Token two-color, container fixed height + overflow-hidden
<div className="relative h-64 overflow-hidden rounded-xl">
  <LightPillar />
  <div className="relative z-10 flex h-full items-center justify-center">
    LightPillar
  </div>
</div>
```
```tsx
// Fine laser: narrow column · high brightness · no particles
<LightPillar pillarWidth={1.4} glowAmount={0.009} noiseIntensity={0} intensity={1.2} />
```

## Usage Guidelines

- OGL/WebGL renders only on the client. SSR, unavailable WebGL, and reduced motion use the token-gradient fallback.
- `glowAmount` operates at a small scale (`0.005` by default). Increase it in small steps such as `0.009`; large jumps quickly overexpose the beam.
- `topColor`/`bottomColor` must use the `--color-` prefix token when passing CSS variables, see [[hulian-token-color-var-needs-color-prefix]].
- Fullscreen background layers in a non-cascading context parent of an opaque background may be obscured by the parent background, see [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
