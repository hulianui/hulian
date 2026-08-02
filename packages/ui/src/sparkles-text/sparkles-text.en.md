---
slug: sparkles-text
name: SparklesText
category: typography
group: text
tags: [animated]
exports: [SparklesText]
status: enriched
---

# SparklesText

> Sparkling text · client-generated star positions and pulse animation + theme-token colors · typography/text · #animated

## When to use

Use SparklesText to surround a short title or brand word with randomly positioned pulsing stars. Use [AuroraText](../aurora-text/aurora-text.md) or [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md) for color flowing through the glyphs, [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) for a sweeping highlight, or [Text](../text/text.md) for static copy. This is a client component because star positions and animation are generated in the browser.

## Import
```ts
import { SparklesText } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | `string[]` | `[primary, chart-1]` tokens | Star colors. |
| sparklesCount | `number` | `8` | Number of stars. |

Inherit `ComponentPropsWithoutRef<"span">` (except `color`), such as `className` / `style`.

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | text to render |

## Example
```tsx
<SparklesText className="text-4xl font-bold text-foreground">Hulian</SparklesText>
```

## Usage guidelines

- Star positions are random and generated on the client. Do not expect server output to contain the final hydrated coordinates. The `"use client"` component may be embedded under a server component but is not itself a pure RSC.
- HulianUI token values in `colors` need the `--color-` prefix, such as `var(--color-primary)`.
- Large `sparklesCount` values add animation nodes and can make a small text area visually cluttered.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
