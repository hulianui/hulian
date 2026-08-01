---
slug: pixel-snow
name: PixelSnow
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [PixelSnow]
status: enriched
---

# PixelSnow

> Pixelated voxel snowfield · Ray-marched hashed snow + depth fade · Square, round, and six-arm snowflake variants (ogl instead of three.js · token color · reduced-motion static fallback) · decoration/backdrop · #animated #webgl

## When to Use

Use it for a falling-snow background on holiday pages, winter campaigns, or login screens. It provides depth fading and adaptive contrast against the surface behind it. For a regular dot field, use [DotPattern](../dot-pattern/dot-pattern.md); for a general animated retro pixel field, use [PixelBlast](../pixel-blast/pixel-blast.md).

## Import
```ts
import { PixelSnow } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| variant | `"square" \| "round" \| "snowflake"` | `"square"` | Snowflake shape: square pixel / dot / six-arm snowflake |
| color | `string` | Adaptive (`--color-foreground`, inverted on low contrast) | Snowflake color. The default adapts to the backdrop so snow stays light on dark surfaces and dark on light surfaces |
| flakeSize | `number` | `0.01` | Snowflake base size (screen space ratio); the bigger, the thicker |
| minFlakeSize | `number` | `1.25` | Minimum projection size of distant snowflakes to prevent sub-pixels from disappearing |
| pixelResolution | `number` | `200` | Number of large pixels across the viewport; lower values create larger, more retro blocks |
| speed | `number` | `1.25` | Falling speed factor; the larger it is, the faster it passes through the field of view |
| depthFade | `number` | `8` | Depth of field fade intensity; the larger the distance, the faster the snow attenuation and the stronger the depth |
| farPlane | `number` | `20` | The furthest clipping distance of the light step; the larger the number, the more visible layers (the higher the performance cost) |
| brightness | `number` | `1` | Overall brightness ratio |
| gamma | `number` | `0.4545` | Gamma correction index (≈1/2.2 sRGB approximation) |
| density | `number` | `0.3` | Snowflake density (snow probability threshold for each grid); the larger, the denser. Recommended 0.05–0.6 |
| direction | `number` | `125` | Wind direction angle (degrees), determines the lateral drift direction |
| className | `string` | — | Passthrough to root container (or reduced-motion fallback div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL; default white point + difference mixed static lattice snow |

## Examples

```tsx
// Default square-pixel snow; the parent must be relative and clip overflow.
<div className="relative h-56 overflow-hidden rounded-xl">
  <PixelSnow />
</div>
```

```tsx
// Customized cold blue + slow wallpaper, higher content stack z
<div className="relative h-56 overflow-hidden rounded-xl">
  <PixelSnow color="oklch(0.85 0.08 230)" speed={0.7} density={0.3} />
  <div className="relative z-10 flex h-full items-center justify-center text-white">
    Hulian component library
  </div>
</div>
```

## Usage Guidelines

- The component covers the full canvas. **The parent container must be `relative`**, and overlay content must use `relative z-10`; otherwise the canvas can cover it. See [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].
- `color` defaults to adaptive color selection based on the actual background color behind it. However, if the component is placed in a container that is opposite to the global theme (such as a dark box under a bright theme), the adaptation is inferred based on the token - explicitly passing `color` is more stable when the color is conflicting.
- WebGL client component (`"use client"`); only fallback is rendered during the SSR phase.
- Headless screenshots can capture a still or blank frame when rAF is throttled. Verify falling motion on a real device or with Playwright measurements; see [[recharts-headless-screenshot-blank-clippath-animation-starved]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
