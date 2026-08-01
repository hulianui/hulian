---
slug: letter-glitch
name: LetterGlitch
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [LetterGlitch]
status: enriched
---

# LetterGlitch

> Character failure rain · Terminal character failure rain background · Canvas equal-width character matrix randomly flips words and colors according to the beat + color interpolation smoothing frame by frame + inner/outer edge vignetting (zero dependence on Canvas 2D·token palette·reduced-motion) · decoration/backdrop · #animated #webgl

## When to Use

Use it for a hacker-terminal or Matrix-style field of glitching characters. Use [DotPattern](../dot-pattern/dot-pattern.md) for static geometric dots, or [GridPattern](../grid-pattern/grid-pattern.md) for a regular line grid. LetterGlitch is a Canvas 2D character matrix built around rapidly changing glyphs and colors.

## Import
```ts
import { LetterGlitch } from "@hulianui/ui"
```

## Props

> Extends `HTMLAttributes<HTMLDivElement>` except for `color`, forwarding native attributes such as `id` and event handlers.

| Name | Type | Default | Description |
|------|------|------|------|
| glitchColors | `string[]` | `["var(--color-chart-2)", "var(--color-chart-1)", "var(--color-chart-4)"]` | Character flicker palette, any CSS color, internal off-screen canvas parsed to RGB interpolation |
| glitchSpeed | `number` | `50` | Minimum interval between adjacent refreshes (ms), the smaller it is, the more restless it is, recommended 20–200 |
| smooth | `boolean` | `true` | Smooth color transition (frame-by-frame interpolation); hard cut after turning off, more blunt fault feeling |
| outerVignette | `boolean` | `true` | Outer edge vignetting (radial fade around) |
| centerVignette | `boolean` | `false` | Center vignetting (dark in the middle→transparent at the edge), used to contrast the embedded content |
| characters | `string` | Uppercase letters + symbols + numbers | Character set that participates in flickering, internally split by code points, supports any Unicode |
| className | `string` | — | Root container className |
| style | `CSSProperties` | — | Forward the root container inline style |

## Examples
```tsx
//Container fixed height + overflow-hidden, component absolute inset-0 filled
<div className="relative h-56 overflow-hidden rounded-xl">
  <LetterGlitch className="absolute inset-0" />
</div>
```
```tsx
//Center Vignetting + Placed Content
<div className="relative h-56 overflow-hidden rounded-xl">
  <LetterGlitch className="absolute inset-0" outerVignette={false} centerVignette />
  <div className="absolute inset-0 flex items-center justify-center">
    <p className="text-lg font-semibold tracking-widest text-white">GLITCH</p>
  </div>
</div>
```

## Usage Guidelines

- Canvas 2D is client only and needs to be used within the client component tree; it is normal for the first frame of SSR to be blank. reduced-motion reduced level.
- The character matrix only has a terminal look on a dark background, and light-colored containers have poor contrast.
- `glitchColors` must use the `--color-` prefix token when passing CSS variables. The bare `var(--primary)` will not be parsed, see [[hulian-token-color-var-needs-color-prefix]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
