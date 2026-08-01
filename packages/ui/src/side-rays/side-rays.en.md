---
slug: side-rays
name: SideRays
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [SideRays]
status: enriched
---

# SideRays

> Corner light rays · Two WebGL beams swing from a selected corner with inverse-square falloff, saturation, and color blending (ogl · token colors · reduced-motion static fallback) · decoration/backdrop · #animated #webgl

## When to Use

You want a slowly swinging volumetric light beam that shoots out from a corner (hero/landing page side lighting). If you want the center spotlight to follow the mouse, use [Spotlight](../spotlight/spotlight.md); if you want full-screen dot/line texture, use [DotPattern](../dot-pattern/dot-pattern.md) / [StripedPattern](../striped-pattern/striped-pattern.md); SideRays is the only special "side light" in this family that emits dual beams from any starting point of the four corners and can adjust the angle/color mixing/saturation.

## Import
```ts
import { SideRays } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| speed | `number` | `2.5` | Beam animation speed factor (2nd beam 0.2× slow dephasing), mapped GLSL iSpeed |
| rayColor1 | `string` | `var(--color-chart-1)` | Main beam color, any CSS color string |
| rayColor2 | `string` | `var(--color-chart-2)` | Auxiliary beam color, superimposed with the main color to produce a mixed color |
| intensity | `number` | `2` | Overall brightness intensity, too high will easily overexpose |
| spread | `number` | `2` | Beam opening angle (sector width), the smaller it is, the more it will gather together |
| origin | `"top-left"｜"top-right"｜"bottom-left"｜"bottom-right"` | `"top-right"` | Beam divergence corner starting point |
| tilt | `number` | `0` | Overall tilt angle of the beam (degrees), rotating sector around the light source point |
| saturation | `number` | `1.5` | Saturation, 1=primary color / >1 enhance color / 0=remove color |
| blend | `number` | `0.75` | Two-bundle color mixing ratio (0–1), 0=primary color only / 1=secondary color only |
| falloff | `number` | `1.6` | The brightness attenuation index with distance, the larger it is, the more concentrated it is near the light source |
| opacity | `number` | `1` | Overall opacity (0–1), commonly used for overlay content 0.5–0.8 |
| className | `string` | — | Additional class name for the root container; the component includes `absolute inset-0 z-0` |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL (default radial-gradient div) |

## Examples
```tsx
// By default, the upper right corner diverges, and the chart token has two colors.
<div className="relative h-56 overflow-hidden rounded-xl">
  <SideRays opacity={0.85} />
</div>

// Starting point in the lower left corner · Warm color double beam
<SideRays
  origin="bottom-left"
  rayColor1="oklch(0.78 0.18 70)"
  rayColor2="oklch(0.7 0.22 30)"
  intensity={2.4}
  opacity={0.8}
/>
```

## Usage Guidelines

- WebGL requires client rendering; the component already declares `"use client"` and can be placed beneath a server-rendered page boundary.
- The component comes with `absolute inset-0 z-0`, and the parent container must have positioning + size + `overflow-hidden`, otherwise it will not be visible.
- High `intensity` can clip to white. Use `opacity` around 0.5–0.8 when rays sit beneath content.
- Under reduced motion or without WebGL, the component renders a directional static fallback. Do not rely on the swing to convey information.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
