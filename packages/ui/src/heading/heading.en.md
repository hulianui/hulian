---
slug: heading
name: Heading
category: typography
group: text
tags: []
exports: [Heading]
status: enriched
---

# Heading

> Heading · Semantic levels 1–6 with independent visual size and weight, polymorphic `as`, zero dependencies, and RSC support · typography/text

## When to use

Use Heading for semantic h1–h6 structure with separately controlled visual size and weight. For example, keep h2 semantics while using an lg appearance, or use `as` to apply heading styles to another element. Use [Text](../text/text.md) for body copy and [Prose](../prose/prose.md) for complete rich-text typography.

## Import
```ts
import { Heading } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| level | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | Title level, determines semantic label `h{level}` and default visual size |
| as | `ElementType` | `h{level}` | Override rendering tags (visual/semantic decoupling, such as level=1 style rendering as div) |
| size | `"xs" \| "sm" \| "base" \| "lg" \| "xl" \| "2xl" \| "3xl" \| "4xl"` | derived by level | Override visual size (independent of level) |
| weight | `"normal" \| "medium" \| "semibold" \| "bold"` | `"semibold"` | Font weight |
| balance | `boolean` | `false` | Enable text-balance to balance line wrapping (multi-line titles are more balanced) |

Inherited `HTMLAttributes<HTMLHeadingElement>` (Omit `color`).

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | title text |

## Examples
```tsx
// Semantic elements with default sizes
<Heading level={1}>First level title</Heading>

// Keep h2 semantics with an lg visual size
<Heading level={2} size="lg"> semantics is h2, vision is lg</Heading>

// Apply heading styles and balanced wrapping to a div
<Heading level={1} as="div" balance> Large visual title </Heading>
```

## Usage guidelines

`level` determines both semantics and the default size. Override `size` to change appearance without damaging the document outline; do not change `level` for visual reasons. Heading has no `size="md"` option, only the base size, for historical compatibility.

## Related
[Text](../text/text.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
