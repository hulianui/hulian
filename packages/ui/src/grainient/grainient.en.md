---
slug: grainient
name: Grainient
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Grainient]
status: enriched
---

# Grainient

> Grain gradients · Three-gamut distortion + WebGL gradient background with film grain · Noise-driven rotation + real-time grain/contrast post (ogl·reduced-motion degraded static gradient) · decoration/backdrop · #animated #webgl

## When to Use

Use it for a calm, flowing three-color gradient with a pronounced film-grain texture behind a hero, sign-in page, empty state, or card. Use [GradientBlinds](../gradient-blinds/gradient-blinds.md) for slats and a spotlight, [Ferrofluid](../ferrofluid/ferrofluid.md) for liquid-metal ridges, or [DotPattern](../dot-pattern/dot-pattern.md) for static geometry. Grainient stays subdued enough to support large areas of foreground text.

## Import
```ts
import { Grainient } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| timeSpeed | `number` | `0.25` | Time flow rate multiplier, 0=static |
| colorBalance | `number` | `0` | Three-color bias, negative bias color3 side, positive bias color1 side |
| warpStrength | `number` | `1` | Domain distortion strength (inversely proportional internally, the larger it is, the more restrained it is), recommended 0.3–3 |
| warpFrequency | `number` | `5` | Domain twisted sinusoidal frequency (wrinkle density) |
| warpSpeed | `number` | `2` | Domain distortion drift speed over time |
| warpAmplitude | `number` | `50` | Domain warp base amplitude, co-determined with warpStrength fold amplitude |
| blendAngle | `number` | `0` | Three-color mixed axial angle (degrees) |
| blendSoftness | `number` | `0.05` | Ribbon transition softness (smoothstep edge width) |
| rotationAmount | `number` | `500` | Overall rotation amount of noise drive (degree) |
| noiseScale | `number` | `2` | Rotation noise sampling scaling, the larger it is, the finer it is |
| grainAmount | `number` | `0.1` | Particle intensity, 0=pure gradient |
| grainScale | `number` | `2` | Particle sampling scaling (density) |
| grainAnimated | `boolean` | `false` | Whether the particles flash over time, static state saves performance |
| contrast | `number` | `1.5` | Contrast, stretched light and dark around mid-grey |
| gamma | `number` | `1` | Gamma correction, <1 to brighten, >1 to darken |
| saturation | `number` | `1` | Saturation, 0=grayscale, >1 to enhance |
| centerX | `number` | `0` | The center of the view is shifted laterally, with zoom framing |
| centerY | `number` | `0` | View center vertical offset |
| zoom | `number` | `0.9` | Zoom, the smaller you see the wider the color field range |
| color1 | `string` | `--color-chart-1` | Gradient first color (bright end), any CSS color |
| color2 | `string` | `--color-chart-2` | Gradient second color (main color/middle section) |
| color3 | `string` | `--color-chart-4` | Gradient third color (dark end) |
| className | `string` | — | Root container, includes `absolute inset-0 z-0` |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / no WebGL static gradient pocket content inside the bottom layer |

## Examples
```tsx
//Default: chart token three-color gamut distorted gradient
<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <Grainient />
  <div className="relative z-10 flex h-full items-center justify-center text-white/85">
Hulian component library
  </div>
</div>
```
```tsx
// Customize warm orange three colors + zoom in
<Grainient color1="oklch(0.82 0.16 70)" color2="oklch(0.62 0.2 30)" color3="oklch(0.32 0.06 300)" zoom={1.3} />
```

## Usage Guidelines

- WebGL/ogl client-side rendering: placed within the `"use client"` boundary; SSR / no WebGL only produces static gradient fallback.
- The root includes `absolute inset-0 z-0`, which needs to be put into the `relative` container; the foreground content needs to be `relative z-10` on top.
- `grainAnimated` Enabling particle recalculation for each frame will increase overhead. It is recommended to keep the default static particles for large-area persistent backgrounds.
- `warpStrength` has "inverse ratio" semantics - the larger the value, the more restrained the distortion. Don't follow your intuition and increase the distortion to make it stronger.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
