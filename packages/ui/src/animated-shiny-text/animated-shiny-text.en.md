---
slug: animated-shiny-text
name: AnimatedShinyText
category: typography
group: text
tags: [animated]
exports: [AnimatedShinyText]
status: enriched
---

# AnimatedShinyText

> Shimmering text · Sweeping highlight for badges and labels + RSC · typography/text · #animated

## When to use

Use AnimatedShinyText to add a sweeping highlight to a short label, such as a pill badge or an "Introducing" banner. For a colorful aurora gradient, use [AuroraText](../aurora-text/aurora-text.md). For a continuously moving inline gradient, use [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md). For ordinary copy, use [Text](../text/text.md).

## Import
```ts
import { AnimatedShinyText } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| shimmerWidth | `number` | `100` | Width of the moving highlight band in pixels. |

Inherits `ComponentPropsWithoutRef<"span">` (`children` / `className` / `style`, etc.).

## Example
```tsx
<div className="rounded-full border border-border bg-surface px-4 py-1.5">
  <AnimatedShinyText className="text-sm">✨ Introducing HulianUI</AnimatedShinyText>
</div>
```

## Usage guidelines

- The effect uses a mask that sweeps across the text, so the text must have a visible foreground color. The highlight can disappear against an extremely light or dark background; a badge container with `border` and `bg-surface` usually provides enough contrast.
- The component does not impose a width or centering layout. Control those through the parent layout or opt in explicitly with `className`.
- The component renders a `<span>`. Empty content has no visible effect, and the text inherits its font size from the surrounding layout.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedGradientText](../animated-gradient-text/animated-gradient-text.md)
