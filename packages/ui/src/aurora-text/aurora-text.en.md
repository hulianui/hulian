---
slug: aurora-text
name: AuroraText
category: typography
group: text
tags: [animated]
exports: [AuroraText]
status: enriched
---

# AuroraText

> Aurora gradient text · Animated background clip + chart tokens + RSC · typography/text · #animated

## When to use

Use AuroraText to add an animated aurora gradient to a short heading or brand phrase. It clips the background to the text and uses four HulianUI chart tokens by default, so it follows light and dark themes. For a sweeping highlight, use [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md). For a moving inline gradient, use [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md). Use [Text](../text/text.md) for ordinary copy, and avoid animating long passages.

## Import
```ts
import { AuroraText } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | `string[]` | 4 HulianUI chart tokens | Gradient stop colors that follow the active theme by default. |
| speed | `number` | `1` | Animation speed multiplier; larger values move faster. |

Inherits `ComponentPropsWithoutRef<"span">` except `color`, including `className` and `style`.

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Text to render. |

## Examples
```tsx
<AuroraText className="text-4xl font-bold">HulianUI</AuroraText>
```

Faster animation:
```tsx
<AuroraText className="text-4xl font-bold" speed={2}>Aurora</AuroraText>
```

## Usage guidelines

- The component renders a `<span>`. The visible effect depends on surrounding `text-*` and `font-*` styles; empty content has no visible effect.
- Every custom `colors` entry must be a valid CSS color. HulianUI tokens need the `--color-` prefix when used in SVG or gradients; see the HulianUI token conventions.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
