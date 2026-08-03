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

> Character glitch field · Monospaced Canvas 2D matrix that periodically swaps glyphs and colors, interpolates transitions frame by frame, and supports inner and outer vignettes · Dependency-free, token-aware, and reduced-motion safe · decoration/backdrop · #animated #webgl

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
| glitchSpeed | `number` | `50` | Minimum interval between updates in milliseconds; lower values feel more frantic, with 20–200 recommended |
| smooth | `boolean` | `true` | Interpolate color changes frame by frame; false switches colors immediately for a harsher glitch |
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

- Canvas 2D renders on the client, so SSR may produce an empty first frame. Reduced-motion users receive the static state.
- The character matrix only has a terminal look on a dark background, and light-colored containers have poor contrast.
- CSS variables in `glitchColors` require the `--color-` prefix. Bare values such as `var(--primary)` do not resolve; see [[hulian-token-color-var-needs-color-prefix]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
