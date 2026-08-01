---
slug: scrambled-text
name: ScrambledText
category: typography
group: text
tags: [animated]
exports: [ScrambledText]
status: enriched
---

# ScrambledText

> Hover-to-scramble text · nearby glyphs cycle through replacement characters before resolving + configurable radius, character set, and speed · dependency-free RAF + reduced-motion support · typography/text · #animated

## When to use

Use ScrambledText when moving the pointer across a title or subtitle should make nearby glyphs scramble and then resolve. Use FuzzyText for a persistent pixel-noise texture, or ScrollFloat and Reveal for entrance animations. ScrambledText keeps the final copy readable and limits the effect to characters inside the pointer radius.

## Import
```ts
import { ScrambledText } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| radius | `number` | `100` | Pointer radius in px. A character scrambles only when its center falls within this radius. |
| duration | `number` | `1.2` | Maximum scramble duration per character in seconds; characters nearer the pointer approach this value. |
| speed | `number` | `0.5` | Replacement speed from 0–1; higher values change glyphs more frequently and resolve faster. |
| scrambleChars | `string` | `".:"` | Characters sampled as temporary replacements. |
| className | `string` | — | Additional root class name, merged with `cn`. |
| style | `CSSProperties` | — | Inline styles for the root element. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Text to be scrambled word by word (plain text only, internally split into single-character spans) |

## Example
```tsx
// Default: .: character set
<ScrambledText>Move the pointer over this text — Hover scrambles the glyphs.</ScrambledText>

// Large radius + full width symbol set
<ScrambledText radius={160} scrambleChars="█▓▒░">
  HULIAN UI · Scramble On Hover
</ScrambledText>
```

## Usage guidelines

- `children` must be plain text. The component splits it into per-character spans, so nested element structure cannot be preserved.
- Radius is measured from each character's center. Characters far from the pointer in a long passage may barely move; this is intentional.
- With reduced motion enabled, the original text renders directly without scrambling.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
