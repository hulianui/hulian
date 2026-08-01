---
slug: ascii-text
name: ASCIIText
category: typography
group: text
tags: [animated]
exports: [ASCIIText]
status: enriched
---

# ASCIIText

> ASCII art text · Pixel-brightness character mapping on Canvas 2D + sine-wave displacement + pointer-driven hue rotation, with no three.js dependency and reduced-motion support · typography/text · #animated

## When to use

Use ASCIIText for a hero, 404 page, or technical accent that renders a short phrase as animated ASCII art. Choose AuroraText for a smooth glowing gradient or AnimatedShinyText for a passing highlight. ASCIIText decomposes each glyph into a character grid and is deliberately effect-heavy, so reserve it for short decorative text.

## Import
```ts
import { ASCIIText } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| text | `string` | `"\u745a\u740f"` | Text to convert into ASCII art. The built-in Chinese copy means “Hulian”; it is rendered to an offscreen canvas, then mapped cell by cell from pixel brightness to characters. |
| asciiFontSize | `number` | `8` | ASCII character size in pixels. Smaller values create a denser grid and require more computation; 6–14 is recommended. |
| textFontSize | `number` | `160` | Source-text size on the offscreen canvas in pixels. Larger values increase sampling resolution; its ratio to `asciiFontSize` approximates the number of character columns. |
| textColor | `string` | `var(--color-foreground)` | Fill color for the source text. It is assigned to Canvas `fillStyle` and must be a color Canvas can parse. |
| enableWaves | `boolean` | `true` | Applies a row-by-row sine-wave phase offset. The animation is disabled when reduced motion is requested. |
| enableHue | `boolean` | `true` | Uses the pointer angle relative to the center to drive `hue-rotate`. Disable it to keep a single hue. |
| charset | `string` | Classic 70-level ramp | Brightness ramp from dark to light. Higher indices represent brighter pixels; provide a custom ramp for a different visual style. |
| className | `string` | — | Additional class name for the root container. |
| style | `CSSProperties` | — | Inline styles passed to the root container. |

## Example
```tsx
// Default: waves, pointer-driven hue, and chart-token color
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <ASCIIText text="HulianUI" className="text-[color:var(--color-chart-1)]" />
</div>

// Static: no waves, no hue rotation, high-density detail
<ASCIIText text="Code" enableWaves={false} enableHue={false} asciiFontSize={6} textFontSize={200} />
```

## Usage guidelines

- Canvas 2D is redrawn continuously, so keep the text short. Long strings create many more grid columns and make each sampled frame more expensive.
- `textColor` is assigned to Canvas `fillStyle` and must be a parseable Canvas color. Use the default token for automatic theme changes; a literal custom color does not switch between light and dark themes.
- Reduced-motion mode stops the wave animation without changing the DOM. Do not use animation state as application state.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
