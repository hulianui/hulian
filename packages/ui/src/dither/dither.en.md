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

> Dither Ripple · Vintage ordered dither ripple WebGL background · Perlin/fbm ripple field + 8×8 Bayer dither + level quantization/pixel mosaic (ogl single pass shader·token·reduced-motion downgrade) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need an 8-bit/pixel art retro-textured ripple background (nostalgic landing pages, game products, brand easter egg pages). For oil paint swirls, use [Balatro](../balatro/balatro.md), for light curtains, [Beams](../beams/beams.md), and for regular dot matrix, use [DotPattern](../dot-pattern/dot-pattern.md); Dither's unique ordered dithering + color-level quantized granular band-like texture is the only background that focuses on a retro pixel look.

## Import
```ts
import { Dither } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| waveSpeed | `number` | `0.05` | Ripple flow speed; frozen to static image under reduced-motion |
| waveFrequency | `number` | `3` | Ripple frequency (fbm multiplier step); the larger the texture, the finer the texture |
| waveAmplitude | `number` | `0.3` | Ripple amplitude attenuation factor (attenuation per octave); the larger, the stronger the high-frequency details |
| waveColor | `string` | `--color-chart-1` | Ripple main color, CSS color string, default theme token light and dark adaptive |
| colorNum | `number` | `4` | Quantized color-step count used with the Bayer matrix; lower values look more 8-bit |
| pixelSize | `number` | `2` | Dithering pixel block size; the larger the mosaic, the thicker it is |
| disableAnimation | `boolean` | `false` | Whether to freeze the waveform into a still frame (equivalent to reduced-motion, can be controlled explicitly) |
| className | `string` | — | Transparent to Canvas (or fallback div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL (default checkerboard + gradient) |

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

- **WebGL client rendering**: relies on ogl + single-pass shader, the SSR stage falls back to `fallback` (checkerboard + gradient); do not mount it directly in the server component.
- **The token color must be prefixed with `--color-`**: `waveColor` The CSS variable must be passed with the full name of `var(--color-chart-1)`, and the bare `var(--chart-1)` will not be parsed. See [[hulian-token-color-var-needs-color-prefix]].
- `colorNum` The smaller the "8-bit", the stronger the graininess, but if it is too small (such as 2), the level of detail will be lost.
- The parent container must be `relative` + `overflow-hidden`.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
