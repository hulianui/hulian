---
slug: text-pressure
name: TextPressure
category: typography
group: text
tags: [animated]
exports: [TextPressure]
status: enriched
---

# TextPressure

> Pointer-pressure heading · per-character interpolation of weight, width, italic axis, and opacity from pointer distance + variable/system-font support + reduced-motion fallback · typography/text · #animated

## When to use

Use TextPressure for a large hero or brand heading whose characters change weight, width, and slant as the pointer approaches. For variable-font axis interpolation in a supplied container coordinate system with tiered falloff, use [VariableProximity](../variable-proximity/variable-proximity.md). Use [Shuffle](../shuffle/shuffle.md) for scramble-and-resolve text.

## Import
```ts
import { TextPressure } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| text | `string` | `"Compressa"` | Render text (character-by-character deformation in response to mouse pressure) |
| fontFamily | `string` | System sans serif stack | Font family; use scaleX+font-weight+opacity to simulate pressure sensitivity under system fonts, and pass in true variable fonts to drive font-variation-settings |
| fontUrl | `string` | — | Custom @font-face font URL; remote fonts are not injected by default (obeying the remote resource access control), only injected when the local/self-hosted address is explicitly passed |
| width | `boolean` | `true` | Whether to drive wdth axis + scaleX to simulate lateral extrusion |
| weight | `boolean` | `true` | Whether to drive wght axis / font-weight becomes thicker with proximity |
| italic | `boolean` | `true` | Whether to drive ital axis (only variable fonts take effect) |
| alpha | `boolean` | `false` | Whether to drive opacity (more opaque when close) |
| flex | `boolean` | `true` | Whether to use flex space-between to fill the characters horizontally |
| stroke | `boolean` | `false` | Whether to stroke (transparent center + token stroke color, hollow outline) |
| scale | `boolean` | `false` | Whether to stretch the text block vertically to fill the height of the container |
| textColor | `string` | `var(--color-foreground)` | Text color (self-adaptive light and dark) |
| strokeColor | `string` | `var(--color-primary)` | Stroke color (valid when stroke=true) |
| minFontSize | `number` | `24` | Minimum font size (px), lower limit when the container is narrow |
| className | `string` | — | Transparent to root div (cn merge) |

## Example
```tsx
// Move the pointer across the heading to change character pressure
<TextPressure text="Compressa" className="flex items-center" />

// Stroke hollow (token primary stroke)
<TextPressure
  text="Hulian"
  stroke
  strokeColor="var(--color-primary)"
  className="flex items-center"
/>
```

## Usage guidelines

- Full `width` and `italic` behavior requires a variable font with `wght`, `wdth`, and `ital` axes. With a system font, width falls back to `scaleX` and italic may have no effect; this is a font limitation.
- The token fed to `strokeColor`/`textColor` must be prefixed with `--color-` (such as `var(--color-primary)`), and bare `var(--primary)` will not be parsed. See [[hulian-token-color-var-needs-color-prefix]].
- Remote fonts are not injected by default; to use self-hosted variable fonts, you must explicitly pass `fontUrl`.
- Reduced-motion mode disables pointer-driven deformation.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
