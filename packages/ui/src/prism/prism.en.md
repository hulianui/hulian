---
slug: prism
name: Prism
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Prism]
status: enriched
---

# Prism

> Prismatic light splitting · WebGL background · ray-march octahedral SDF refracts rainbow volumetric light + rotate/3drotate/hover three postures (ogl·theme hue adaptive·reduced-motion degradation) · decoration/backdrop · #animated #webgl

## When to Use

Use it for a centered, volumetric prism with refracted rainbow edges in a product hero or brand visual. For a multi-lobed burst radiating from the center, use [PrismaticBurst](../prismatic-burst/prismatic-burst.md); for a full-surface flow texture, use [Plasma](../plasma/plasma.md) or [PlasmaWave](../plasma-wave/plasma-wave.md).

## Import
```ts
import { Prism } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| height | `number` | `3.5` | Pyramid height (along the Y-axis); the larger, the taller the light column, the more slender it is |
| baseWidth | `number` | `5.5` | The width of the pyramid base; together with height determines the ratio of fat to thin |
| animationType | `"rotate" \| "3drotate" \| "hover"` | `"rotate"` | rotate=XZ sinusoidal breathing swing (no overall rotation) / 3drotate=three-axis pseudo-random rotation / hover=follow the global pointer tilt (with inertia) |
| glow | `number` | `1` | Volume glow intensity; 0 = no glow (dark outline) |
| offset | `{ x?: number; y?: number }` | `{ x: 0, y: 0 }` | The pyramid is translated from the center of the screen (CSS pixels), and the composition avoids content |
| noise | `number` | `0.5` | Grain noise intensity (film-like film grain); 0 = pure and grain-free |
| transparent | `boolean` | `true` | When true, the canvas alpha shows through the background color, and automatically increases the saturation to make it more transparent |
| scale | `number` | `3.6` | The overall zoom of the prism; the larger it is, the more it occupies the viewport |
| hueShift | `number` | Topic derivation (`--color-chart-1`) | Hue rotation (radians); explicit value passing will superimpose offset on the basis of automatic derivation |
| colorFrequency | `number` | `1` | Spectral color frequency; the larger, the denser the rainbow stripes, the smaller, the wider the color band |
| hoverStrength | `number` | `2` | Following intensity in hover mode; the larger the value, the greater the tilt amplitude |
| inertia | `number` | `0.05` | Hover mode inertia coefficient 0–1; the smaller it is, the "stickier" it is and the longer it will ease |
| bloom | `number` | `1` | Flood overlay; multiplied by glow to amplify the overall brightness |
| timeScale | `number` | `0.5` | Time scaling (overall animation speed); 0 = freeze to a static frame |
| className | `string` | — | Passthrough to root container (or reduced-motion fallback div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL; default chart token radial glow gradient |

## Examples

```tsx
//Default: rotate breath swing + theme hue (parent container must be relative)
<div className="relative h-64 overflow-hidden rounded-xl">
  <Prism />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">Prism</p>
  </div>
</div>
```

```tsx
// hover follows pointer + three-dimensional rotation
<Prism animationType="hover" hoverStrength={2.4} inertia={0.06} />
```

## Usage Guidelines

- The component includes `absolute inset-0 z-0`. **The parent must be `relative`**, and overlay content must use `relative z-10`; otherwise the canvas can cover it. See [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].
- `animationType="hover"` follows the **global pointer** (not limited to the container), and only this mode hangs pointer monitoring; rotate/3drotate does not respond to the mouse.
- WebGL client component (`"use client"`); only fallback is rendered during the SSR phase.
- `hueShift` is derived from `--color-chart-1`, the theme hue is analyzed by off-screen canvas, **token must be prefixed with `--color-`** [[oklch-css-var-color-must-parse-via-offscreen-canvas]].
- Headless screenshots can capture a still or blank frame when rAF is throttled. Verify rotation on a real device or with Playwright measurements; see [[recharts-headless-screenshot-blank-clippath-animation-starved]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
