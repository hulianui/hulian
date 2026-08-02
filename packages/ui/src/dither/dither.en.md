---
slug: dither
name: Dither
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Dither]
status: enriched
---

# Dither

> Dither ripple · Retro WebGL backdrop combining a Perlin/FBM wave field, 8×8 Bayer dithering, color quantization, and pixel blocks · Theme-aware color and a reduced-motion fallback · OGL single-pass shader · decoration/backdrop · #animated #webgl

## When to Use

Use it for an 8-bit, pixel-art ripple backdrop on nostalgic landing pages, game interfaces, or playful brand pages. Use [Balatro](../balatro/balatro.md) for painted swirls, [Beams](../beams/beams.md) for light curtains, or [DotPattern](../dot-pattern/dot-pattern.md) for a regular dot matrix. Dither is the option built specifically around ordered dithering and color quantization.

## Import
```ts
import { Dither } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| waveSpeed | `number` | `0.05` | Ripple flow speed; frozen to static image under reduced-motion |
| waveFrequency | `number` | `3` | FBM frequency multiplier; higher values create finer ripple detail |
| waveAmplitude | `number` | `0.3` | Per-octave amplitude factor; higher values preserve more high-frequency detail |
| waveColor | `string` | `--color-chart-1` | Main ripple color; accepts any CSS color and defaults to a light/dark theme token |
| colorNum | `number` | `4` | Quantized color-step count used with the Bayer matrix; lower values look more 8-bit |
| pixelSize | `number` | `2` | Dither-block size; higher values produce a coarser mosaic |
| disableAnimation | `boolean` | `false` | Freeze the wave field on a still frame, matching reduced-motion behavior |
| className | `string` | — | Class name forwarded to the canvas or fallback div |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Static non-WebGL content for SSR, reduced motion, or unavailable WebGL; defaults to a checkerboard gradient |

## Examples
```tsx
// Default jitter ripple
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <Dither />
</div>
```
```tsx
// Coarse mosaic pixel art + custom color + freeze still
<Dither
  waveColor="oklch(0.72 0.22 40)"
  pixelSize={6}
  colorNum={3}
  disableAnimation
/>
```

## Usage Guidelines

- **WebGL client rendering**: this effect relies on OGL and a single-pass shader. SSR renders the checkerboard-gradient `fallback`; do not import the realtime implementation directly into a server component.
- **Token colors require the `--color-` prefix**: pass `waveColor="var(--color-chart-1)"`. Bare names such as `var(--chart-1)` do not resolve. See [[hulian-token-color-var-needs-color-prefix]].
- Lower `colorNum` values strengthen the 8-bit look, but very low values such as 2 discard substantial detail.
- The parent container must be `relative` + `overflow-hidden`.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
