---
slug: split-text
name: SplitText
category: typography
group: text
tags: [animated]
exports: [SplitText]
status: enriched
---

# SplitText

> Staggered text entrance · split by character or word + one-time viewport-triggered offset and fade + whole-text accessible label + reduced-motion final state · typography/text · #animated

## When to use

Use SplitText when a title or hero line should enter once with a staggered character- or word-level offset and fade. Use [BlurText](../blur-text/blur-text.md) for a blur-to-clear entrance, [ScrollReveal](../scroll-reveal/scroll-reveal.md) for continuous word progress tied to scrolling, or [Heading](../heading/heading.md) for static headings.

## Import
```ts
import { SplitText } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| text * | `string` | — | Text to animate. |
| splitType | `"char" \| "word"` | `"char"` | Splits into characters or whitespace-delimited words. |
| from | `"bottom" \| "top" \| "left" \| "right"` | `"bottom"` | Direction from which each segment enters. |
| delay | `number` | `40` | Delay between adjacent segments in milliseconds. Larger values create a slower wave. |
| duration | `number` | `0.5` | Single segment animation duration (seconds) |

The remaining `<span>` native attributes (`className`, etc.) are transparently transmitted; `onDrag/onDragStart/onDragEnd/onAnimationStart` is eliminated due to conflict with the motion signature.

## Example
```tsx
<SplitText text="Build faster, safer, and more beautifully" className="text-3xl font-bold text-foreground" />

<SplitText
  text="Build faster with HulianUI"
  splitType="word"
  from="left"
  className="text-3xl font-bold text-primary"
/>
```

## Usage guidelines

- `useInView` triggers only once, so the entrance does not replay. Change `key` to force a remount when a replay is required in a demo.
- `text` accepts a plain string rather than `children`; JSX cannot be embedded.
- Under `prefers-reduced-motion`, every segment renders directly in its final state.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
