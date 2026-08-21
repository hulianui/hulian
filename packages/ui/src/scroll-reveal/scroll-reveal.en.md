---
slug: scroll-reveal
name: ScrollReveal
category: typography
group: text
tags: [animated]
exports: [ScrollReveal]
status: enriched
---

# ScrollReveal

> Scroll-driven paragraph reveal · per-word opacity and blur tied to viewport progress + independent word intervals + readable reduced-motion fallback · typography/text · #animated

## When to use

Use ScrollReveal to resolve a long passage from dim and blurred to clear, word by word as the page scrolls. Use [SplitText](../split-text/split-text.md) for a one-time staggered entrance not tied to scroll progress, [BlurText](../blur-text/blur-text.md) for a one-time blur reveal, or [Prose](../prose/prose.md) for static paragraphs.

## Import
```ts
import { ScrollReveal } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| baseOpacity | `number` | `0.12` | Opacity of unrevealed words from 0-1; lower values create stronger contrast. |
| baseRotation | `number` | `3` | Initial paragraph rotation in degrees, returning to 0 with progress; set to 0 to disable. |
| enableBlur | `boolean` | `true` | Blurs unrevealed words and clears them with progress. |
| blurStrength | `number` | `4` | When `enableBlur` is true, the starting blur radius (px) of the word will decrease to 0 as the progress progresses. |
| scrollContainerRef | `RefObject<HTMLElement \| null>` | Auto-detected | Scroll container that drives the animation. **The nearest scrollable ancestor is detected automatically**, so the effect also works inside a drawer, popover, or gallery preview and normally needs no value. Pass it only when the scroll source is not a DOM ancestor, such as a custom scrolling implementation. |

The remaining `<p>` native attributes are transparently transmitted; `onDrag/onDragStart/onDragEnd/onAnimationStart` is eliminated due to conflict with the motion signature.

## Slots

| Slot | Type | Description |
|------|------|------|
| children * | `string` | Entire text to be rendered word by word as scrolling, string only (words broken internally by whitespace and delimiters preserved) |

## Example
```tsx
<ScrollReveal className="text-xl font-semibold">
  When you scroll this block the words resolve from blur to focus one by one.
</ScrollReveal>

<ScrollReveal enableBlur={false} baseRotation={6} className="text-xl font-semibold">
  Opacity and rotation alone create a restrained heading treatment.
</ScrollReveal>
```

## Usage guidelines

- The effect depends on scroll progress. Leave scrollable space above and below the component to see the full word sequence; in a non-scrolling container it remains at rest.
- `children` accepts plain strings only, not JSX.
- Under `prefers-reduced-motion`, all text renders fully opaque and unblurred.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
