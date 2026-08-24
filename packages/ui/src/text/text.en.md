---
slug: text
name: Text
category: typography
group: text
tags: []
exports: [Text]
status: enriched
---

# Text

> Applies semantic size, tone, weight, truncation, and polymorphic element choices to text. · typography/text

## When to use

Use Text for body copy, supporting guidance, or inline content that needs consistent size, semantic tone, weight, and truncation. Use [Heading](../heading/heading.md) for h1-h6 semantics and heading scales, or [Prose](../prose/prose.md) for a complete rich-text passage.

## Import
```ts
import { Text } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| as | `ElementType` | `"p"` | Rendered element tag |
| size | `"xs" \| "sm" \| "base" \| "lg" \| "xl"` | `"base"` | Font size |
| tone | `"default" \| "muted" \| "primary" \| "success" \| "warning" \| "danger"` | `"default"` | Semantic hue (self-adaptation of light and dark) |
| weight | `"normal" \| "medium" \| "semibold" \| "bold"` | `"normal"` | Font weight |
| family | `"sans" \| "mono"` | - | Font family; omitting it inherits the surrounding font |
| numeric | `boolean` | `false` | Uses tabular numerals |
| truncate | `boolean` | `false` | Single line ellipsis truncation |
| lineClamp | `number` | - | Multi-line truncation (up to n lines following ellipses); takes precedence over truncate when set |

Inherited `HTMLAttributes<HTMLElement>` (Omit `color`, the tone is changed to tone).

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | text content |

## Example
```tsx
// Semantic tones
<Text tone="muted">Auxiliary instructions</Text>
<Text tone="success">3/3 points · Correct</Text>
<Text tone="warning">Low mastery rate</Text>
<Text tone="danger">Danger warning</Text>

// Font family and tabular numerals; omit family to inherit the surrounding font
<Text family="mono">pnpm add @hulianui/ui</Text>
<Text numeric>12,345.67</Text>
<Text family="mono" numeric>2026-08-24 09:30</Text>

// Multi-line truncation
<div className="max-w-xs">
  <Text lineClamp={2}>{longText}</Text>
</div>
```

## Usage guidelines

`truncate` works only when the container has a constrained width. If both `lineClamp` and `truncate` are set, `lineClamp` takes precedence.

## Related
[Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
