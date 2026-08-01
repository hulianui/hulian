---
slug: dark-veil
name: DarkVeil
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [DarkVeil]
status: enriched
---

# DarkVeil

> Dark curtain · CPPN neural field dark flowing curtain WebGL background · Hue rotation/scanline/particle/space distortion (ogl·lazy loading·reduced-motion degraded static gradient) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a deep and restrained dark flowing curtain background (dark landing page, console Hero, immersive cover). If you want multi-color bands, use [ColorBends](../color-bends/color-bends.md), if you want bright light curtains, use [Beams](../beams/beams.md), if you want oil vortexes, use [Balatro](../balatro/balatro.md); DarkVeil is a single dark tone neural field, focusing on deep atmosphere rather than bright colors, and has retro display textures such as scan lines/grains.

## Import
```ts
import { DarkVeil } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| hueShift | `number` | `0` | Hue shift (0–360 degrees), YIQ hue rotation to create cool blue/warm purple/turquoise tone |
| noiseIntensity | `number` | `0` | Grain noise intensity, CRT/film texture; recommended 0–0.1, excessive snowflakes |
| scanlineIntensity | `number` | `0` | Scan line intensity, retro display look and feel; recommended 0–0.5, need to match the frequency |
| speed | `number` | `0.5` | Animation speed factor; 0=still (still renders a static frame) |
| scanlineFrequency | `number` | `0` | Scan line frequency (density); scanlineIntensity > 0 is required to be visible |
| warpAmount | `number` | `0` | Space distortion amount, UV sine and cosine perturbation produces fluctuations/refraction; recommended 0–0.2 |
| resolutionScale | `number` | `1` | Rendering resolution scaling; <1 downsampling to save power, >1 oversampling for clarity |
| className | `string` | — | Forwarded to the root container (or fallback div), comes with absolute inset-0 z-0 |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL (default dark radial gradient) |

## Examples
```tsx
// Default cool curtain
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 280)" }}>
  <DarkVeil />
</div>
```
```tsx
// Retro monitor: scanline + grain
<DarkVeil
  hueShift={200}
  scanlineIntensity={0.35}
  scanlineFrequency={1.6}
  noiseIntensity={0.04}
  speed={0.4}
/>
```

## Usage Guidelines

- **WebGL client rendering + lazy loading**: relies on ogl + WebGL, the SSR stage falls back to `fallback` (dark radial gradient); do not mount it directly in the server component.
- **Linkage parameters**: `scanlineFrequency` must be matched with `scanlineIntensity > 0` to be visible; `noiseIntensity` will produce snowflakes if it exceeds 0.1.
- **Performance Knob**: Turn down `resolutionScale` (such as 0.6) to save power on lower-end devices or when overlaying multiple instances.
- The parent container must be `relative` + `overflow-hidden`.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
