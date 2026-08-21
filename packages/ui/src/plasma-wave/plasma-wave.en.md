---
slug: plasma-wave
name: PlasmaWave
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [PlasmaWave]
status: enriched
---

# PlasmaWave

> Plasma wave · WebGL background · Ray-marched interwoven ribbons + weighted two-color blend (ogl · theme-aware chart tokens · reduced-motion gradient fallback) · decoration/backdrop · #animated #webgl

## When to Use

Use it for a dense, two-color atmospheric background with interwoven ribbons. Independent speeds, bends, offsets, and rotation support richer compositions than [Plasma](../plasma/plasma.md). For pointer-stirred liquid color, use [LiquidEther](../liquid-ether/liquid-ether.md); for regular geometry, use [DotPattern](../dot-pattern/dot-pattern.md).

## Import
```ts
import { PlasmaWave } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | `string[]` | `["var(--color-chart-1)","var(--color-chart-2)"]` | CSS color pair; only the first two values are used and token values follow the active theme |
| xOffset | `number` | `0` | Offset the ribbon horizontally (device pixels), moving the ripple focus away from the center |
| yOffset | `number` | `0` | Ribbon vertical offset (device pixels) |
| rotationDeg | `number` | `0` | Overall rotation angle (degrees), arranging transverse wave bands diagonally for more tension |
| focalLength | `number` | `0.8` | Focal length (sight convergence); the larger, the more concentrated the depth, the smaller the more spread. Recommendation 0.4-1.6 |
| speed1 | `number` | `0.05` | The flow rate of the first ribbon; the bigger, the faster |
| speed2 | `number` | `0.05` | Second ribbon flow rate |
| dir2 | `number` | `1` | Second-ribbon direction: +1 follows the first ribbon and -1 reverses it to emphasize interweaving |
| bend1 | `number` | `1` | The bending amplitude of the first ribbon; the greater the undulations, the more exaggerated |
| bend2 | `number` | `0.5` | The bending amplitude of the second ribbon |
| className | `string` | - | Additional class name for the canvas container or fallback div, often used for sizing, rounding, and opacity |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL; overlaid on top of a static gradient |

## Examples

```tsx
//Default: chart token two-color waveband (must come with absolute inset-0 and fill the relative parent container)
<div className="relative h-56 overflow-hidden rounded-xl">
  <PlasmaWave className="absolute inset-0" />
  <div className="absolute inset-0 flex items-center justify-center text-white/80">PlasmaWave</div>
</div>
```

```tsx
// Hedge flow direction + warm color: dir2 reverse interweave
<PlasmaWave
  className="absolute inset-0"
  colors={["var(--color-chart-3)", "oklch(0.72 0.22 30)"]}
  dir2={-1}
  speed1={0.1}
  bend1={1.4}
/>
```

## Usage Guidelines

- Unlike components of the same family, PlasmaWave **does not come with its own positioning class**. You must pass `className="absolute inset-0"` yourself to cover the `relative` parent container, and use `absolute inset-0` / `relative z-10` [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]] for overlay content.
- WebGL client component (`"use client"`); only fallback is rendered during the SSR phase.
- `colors` is parsed by off-screen canvas when passing `var(--color-…)`, **must be prefixed with `--color-`**, and the parsing of bare `var(--primary)` fails with [[oklch-css-var-color-must-parse-via-offscreen-canvas]].
- Headless screenshots can capture a still or blank frame when rAF is throttled. Verify motion on a real device or with Playwright measurements; see [[recharts-headless-screenshot-blank-clippath-animation-starved]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
