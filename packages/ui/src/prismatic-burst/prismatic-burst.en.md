---
slug: prismatic-burst
name: PrismaticBurst
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [PrismaticBurst]
status: enriched
---

# PrismaticBurst

> Prismatic light burst · Center-radiating volumetric spectrum with bend distortion, configurable lobes, 3D rotation, and pointer following · Chart-token palette + lazy ogl lifecycle (StrictMode-safe · reduced-motion radial fallback) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a "spectral ray bursting from the center" as a strong visual focus (product release page, event Hero), with the largest sense of radiation and spectrum span. If you want a single pyramid light splitter, choose [Prism](../prism/prism.md), if you want a full flow texture, choose [Plasma](../plasma/plasma.md) / [PlasmaWave](../plasma-wave/plasma-wave.md); this component is a central radiated light burst, the number of petals can be adjusted to make a hexagram/starburst, and `mixBlendMode` is often used for superimposed base images.

## Import
```ts
import { PrismaticBurst } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| intensity | `number` | `2` | Overall brightness gain (directly multiplied by the final color); 0=full black |
| speed | `number` | `1` | Volume step animation speed factor; the larger it is, the faster it surges |
| animationType | `"rotate" \| "rotate3d" \| "hover"` | `"rotate"` | rotate=single-axis plane rotation (most restrained)/rotate3d=three-dimensional Euler rotation/hover=tilt following the pointer |
| colors | `string[]` | `--color-chart-1..5` | Color strip (baked into a one-dimensional gradient texture and sampled according to march progress); any CSS color string, default chart token light and dark adaptive |
| distort | `number` | `0` | Light bending and distortion amount 0–50 (clamped within the shader); the larger the ray, the more likely it is to be twisted by a gravitational lens |
| noiseAmount | `number` | `0` | Grain jitter noise amount 0–1; weaken the sense of banding |
| rayCount | `number` | `0` | Number of radiation beam lobes; 0=continuous halo, >0 comb N symmetrical rays according to angle (6=hexagram) |
| offset | `{ x?: number; y?: number }` | `{ x: 0, y: 0 }` | The offset of the burst center relative to the center of the screen (CSS pixels), x is positive to the right, y is positive downward |
| mixBlendMode | `string` | `"none"` | `mix-blend-mode` forwarded to the canvas; `lighten` and `screen` are useful for overlay compositions |
| className | `string` | — | Merge into root container (or reduced div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL; default chart token radial light burst gradient |

## Examples

```tsx
// Default continuous halo and token spectrum; the parent must be relative and clip overflow.
<div className="relative h-56 overflow-hidden rounded-xl">
  <PrismaticBurst className="opacity-90" />
  <div className="absolute inset-0 flex items-center justify-center text-white/80">PrismaticBurst</div>
</div>
```

```tsx
// Six-petal starburst + brighten
<PrismaticBurst rayCount={6} intensity={2.4} className="opacity-95" />
```

## Usage Guidelines

- The component covers the entire canvas, **the parent container must be `relative` + `overflow-hidden`, and the overlay content must be `absolute inset-0` / `relative z-10`**, otherwise the content [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]] will be covered.
- WebGL client component (`"use client"`), ogl lazy loading and reuse useGlCanvas are safe for React StrictMode dual mounting; only fallback is rendered in the SSR stage.
- `colors` is parsed by off-screen canvas when passing `var(--color-…)`, **must be prefixed with `--color-`**, and the parsing of bare `var(--primary)` fails with [[oklch-css-var-color-must-parse-via-offscreen-canvas]].
- Headless screenshots can capture a still or blank frame when rAF is throttled. Verify the burst on a real device or with Playwright measurements; see [[recharts-headless-screenshot-blank-clippath-animation-starved]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
