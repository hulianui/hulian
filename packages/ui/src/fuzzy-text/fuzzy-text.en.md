---
slug: fuzzy-text
name: FuzzyText
category: typography
group: text
tags: [animated]
exports: [FuzzyText]
status: enriched
---

# FuzzyText

> Noisy canvas text · Row/column scan displacement with stronger hover jitter, token colors, no dependencies, and a reduced-motion static frame · typography/text · #animated

## When to use

Use FuzzyText for a short, bold 404 or technical heading with signal noise and scan displacement. Use ScrambledText for hover-driven character scrambling or AuroraText for a smooth luminous gradient. FuzzyText shifts canvas rows and columns, so it works best on compact display text.

## Import
```ts
import { FuzzyText } from "@hulianui/ui"
```

## Props

Inherit `CanvasHTMLAttributes<HTMLCanvasElement>` (go to `color`/`children`/`style`), the core is as follows:

| Name | Type | Default | Description |
|------|------|------|------|
| fontSize | `number \| string` | `"clamp(2rem, 10vw, 10rem)"` | Numbers are in px, strings are in any CSS length (including clamp), and the viewport is adaptive. |
| fontWeight | `number \| string` | `900` | Font weight, noise in thick strokes is more eye-catching |
| fontFamily | `string` | `"inherit"` | Font family, inherit reads canvas computed font-family |
| color | `string` | `var(--color-foreground)` | Fill color, according to the light and dark theme; any CSS color can be passed (including var()/currentColor, internally analyzed by computed style); style.color has higher priority |
| enableHover | `boolean` | `true` | Pointer jitter increases when within text range |
| baseIntensity | `number` | `0.18` | Resting state noise intensity (0-1), the larger the value, the “hairier” it is |
| hoverIntensity | `number` | `0.5` | Hover state noise intensity (0-1) |
| fuzzRange | `number` | `30` | The maximum pixel displacement amplitude of each row/column determines the noise dispersion range |
| direction | `"horizontal" \| "vertical" \| "both"` | `"horizontal"` | Dithering direction: left and right by row/up and down by column/overlay of both |
| className | `string` | - | supports canvas extra className |
| style | `CSSProperties` | - | supports canvas inline styles |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Text to render (plain text only, will be spelled into one line) |

## Examples
```tsx
// Default horizontal scan noise
<FuzzyText fontSize="clamp(2rem, 8vw, 5rem)">HulianUI</FuzzyText>

// 404 heading with strong displacement and primary color
<FuzzyText fontSize="clamp(3rem, 14vw, 8rem)" fuzzRange={42} baseIntensity={0.3} color="var(--color-chart-1)">
  404
</FuzzyText>
```

## Usage guidelines

- Rendering uses `<canvas>`, so children should be plain text; nested elements are flattened into a string.
- Color is resolved through computed styles. `var(--color-*)` and `currentColor` work, but Canvas cannot consume Tailwind classes directly; use the color prop or style.color.
- Reduced-motion mode renders a readable static frame. Do not use jitter as the only feedback.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
