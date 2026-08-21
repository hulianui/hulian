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
| text | `string` | `"Compressa"` | Text to render as individually responsive characters. |
| fontFamily | `string` | System sans serif stack | Font family. System fonts simulate the effect with `scaleX`, `font-weight`, and opacity; a true variable font enables `font-variation-settings`. |
| fontUrl | `string` | - | URL for a custom `@font-face`. Omitting it or passing an empty string loads no external font; any nonempty URL is injected without origin validation. Project policy requires callers to use a local or self-hosted asset. |
| width | `boolean` | `true` | Whether to animate the `wdth` axis and use `scaleX` as a fallback. |
| weight | `boolean` | `true` | Whether to animate the `wght` axis or `font-weight` based on proximity. |
| italic | `boolean` | `true` | Whether to animate the `ital` axis; effective only with a compatible variable font. |
| alpha | `boolean` | `false` | Whether characters become more opaque as the pointer approaches. |
| flex | `boolean` | `true` | Whether to distribute characters across the available width with flexbox. |
| stroke | `boolean` | `false` | Whether to render a hollow outline with transparent fill and the configured stroke color. |
| scale | `boolean` | `false` | Whether to stretch the text vertically to fill the container height. |
| textColor | `string` | `var(--color-foreground)` | Text color, using a theme-aware token by default. |
| strokeColor | `string` | `var(--color-primary)` | Outline color when `stroke` is enabled. |
| minFontSize | `number` | `24` | Minimum font size in pixels when the container narrows. |
| className | `string` | - | Additional class name merged onto the root `div`. |

## Example
```tsx
// Move the pointer across the heading to change character pressure
<TextPressure text="Compressa" className="flex items-center" />

// Hollow text with the primary theme token as its outline
<TextPressure
  text="Hulian"
  stroke
  strokeColor="var(--color-primary)"
  className="flex items-center"
/>
```

## Usage guidelines

- Full `width` and `italic` behavior requires a variable font with `wght`, `wdth`, and `ital` axes. With a system font, width falls back to `scaleX` and italic may have no effect; this is a font limitation.
- Tokens passed to `strokeColor` or `textColor` must use the `--color-` prefix, such as `var(--color-primary)`; bare `var(--primary)` is not resolved. See [[hulian-token-color-var-needs-color-prefix]].
- With no `fontUrl`, TextPressure does not load an external font. Any nonempty `fontUrl` injects an `@font-face` rule; the component does not validate whether the URL is local or remote. Project policy requires callers to provide a local or self-hosted asset, but runtime code does not enforce that policy.
- Reduced-motion mode disables pointer-driven deformation.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
