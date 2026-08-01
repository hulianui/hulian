---
slug: animated-gradient-text
name: AnimatedGradientText
category: typography
group: text
tags: [animated]
exports: [AnimatedGradientText]
status: enriched
---

# AnimatedGradientText

> Animated gradient text · Inline chart-token gradient + RSC · typography/text · #animated

## When to use

Use AnimatedGradientText to add a moving gradient to a short inline phrase. It participates in normal inline layout and uses HulianUI chart tokens by default. For an aurora texture suited to large headings, use [AuroraText](../aurora-text/aurora-text.md). For a sweeping highlight on a badge or label, use [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md).

## Import
```ts
import { AnimatedGradientText } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | `string[]` | HulianUI chart tokens | Gradient stop colors. |
| speed | `number` | `1` | Animation speed multiplier. |

Inherits `ComponentPropsWithoutRef<"span">` (except `color`), such as `className` / `style`.

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Text to render |

## Example
```tsx
<AnimatedGradientText className="text-2xl">🎉 New HulianUI component library</AnimatedGradientText>
```

## Usage guidelines

- The component renders an inline `<span>` and reveals the gradient by clipping it to the text. Empty content has no visible effect, and the result inherits its font size from the surrounding text.
- When using HulianUI tokens in a custom `colors` array, include the `--color-` prefix so the values can be resolved inside the gradient. See the HulianUI token conventions.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
