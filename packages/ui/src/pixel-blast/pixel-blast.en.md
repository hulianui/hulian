---
slug: pixel-blast
name: PixelBlast
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [PixelBlast, pixelBlastShowcase]
status: enriched
---

# PixelBlast

> Animated dithered pixel field · fBm noise + 8×8 Bayer ordered dithering rendered as square, circle, triangle, or diamond pixels + edge fade (ogl · tokens · reduced-motion static fallback) · decoration/backdrop · #animated #webgl

## When to Use

Use it for an animated retro halftone or dot-print background with built-in edge fading for layered content. For a static regular dot field, use [DotPattern](../dot-pattern/dot-pattern.md); for an 8-bit perspective grid, use [RetroGrid](../retro-grid/retro-grid.md); for a moving focus light, use [Spotlight](../spotlight/spotlight.md). PixelBlast adds noise-driven motion and optional size jitter.

## Import
```ts
import { PixelBlast, pixelBlastShowcase } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| variant | `"square" \| "circle" \| "triangle" \| "diamond"` | `"square"` | Pixel unit shape: square (sharp retro) / dot (dot printing feel) / triangle (texture) / diamond (diamond dot) |
| pixelSize | `number` | `4` | Pixel size in CSS pixels; lower values are denser and finer. Recommended range 2–12 |
| color | `string` | `--color-primary` | Pixel main color, CSS color string; default is primary token light and dark adaptive |
| patternScale | `number` | `2` | Noise texture scaling; the larger the patches, the finer and denser the flashes. Recommendation 0.5–6 |
| patternDensity | `number` | `1` | Pixel filling density; the larger it is, the more pixels will be lit and the more "full" it will be. Recommendation 0.4–1.6 |
| pixelSizeJitter | `number` | `0` | Random jitter amplitude for each square size 0–1; the larger, the more jagged, the stronger the graininess |
| speed | `number` | `0.5` | Animation speed factor; 0 = still picture (still renders one frame of static lattice) |
| edgeFade | `number` | `0.5` | Edge-fade width from 0–1 relative to the shorter side; 0 keeps hard edges, while higher values soften the corners |
| className | `string` | — | Additional class name for the root container or reduced-motion fallback div |
| style | `CSSProperties` | — | Inline styles passed through to the root container |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL; default primary token radial-gradient dot matrix (CSS mask simulated dots) |

## Examples

```tsx
// Default primary-token square field; the parent must be relative.
<div className="relative h-64 overflow-hidden rounded-xl">
  <PixelBlast />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">PixelBlast</p>
  </div>
</div>
```

```tsx
// Dot printing feel + increase pixels
<PixelBlast variant="circle" pixelSize={6} />
```

## Usage Guidelines

- The component comes with `absolute inset-0 z-0`, **the parent container must be `relative`, and the overlay content must be `relative z-10`**, otherwise the content [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]] will be covered.
- WebGL client component (`"use client"`); only fallback is rendered during the SSR phase.
- `color` is parsed by off-screen canvas when passing `var(--color-…)`, **must be prefixed with `--color-`**, and the parsing of bare `var(--primary)` fails with [[oklch-css-var-color-must-parse-via-offscreen-canvas]].
- Headless screenshots can capture a still or blank frame when rAF is throttled. Verify motion on a real device or with Playwright measurements; see [[recharts-headless-screenshot-blank-clippath-animation-starved]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
