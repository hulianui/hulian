---
slug: blur-text
name: BlurText
category: typography
group: text
tags: [animated]
exports: [BlurText]
status: enriched
---

# BlurText

> Blur reveal · Staggered blur-and-offset transition triggered on viewport entry, with top/bottom direction, full-text aria-label, and reduced-motion support · typography/text · #animated

## When to use

Use BlurText when a heading or sentence should resolve from blur and displacement as it enters the viewport. The effect feels more like a camera pulling focus than a simple offset fade. Use [SplitText](../split-text/split-text.md) for a staggered reveal without blur, [ScrollReveal](../scroll-reveal/scroll-reveal.md) for word-by-word progress tied to scrolling, or [Heading](../heading/heading.md) for a static heading.

## Import
```ts
import { BlurText } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| text * | `string` | — | Text to reveal one segment at a time. |
| splitType | `"char" \| "word"` | `"word"` | Segmentation granularity: words split on whitespace, or individual characters. |
| direction | `"top" \| "bottom"` | `"top"` | Entry direction, applied as a vertical offset with a slight midpoint overshoot. |
| delay | `number` | `120` | Delay between adjacent segments in milliseconds; larger values slow the stagger. |
| blur | `number` | `8` | Initial blur radius in pixels; the animation resolves it to zero. |
| stepDuration | `number` | `0.5` | Total duration of one segment's two-stage reveal in seconds. |
| threshold | `number` | `0.3` | Visible viewport proportion that triggers the animation (`useInView` amount), from 0 to 1. |

All other native `<p>` attributes are supported. The `onDrag/onDragStart/onDragEnd/onAnimationStart` handlers are omitted because their signatures conflict with Motion.

## Events

| Event | Type | Description |
|------|------|------|
| onAnimationComplete | `() => void` | Called once after the entire sentence finishes animating. |

## Examples
```tsx
<BlurText text="Isn't this so cool?!" className="text-3xl font-bold text-foreground" />

<BlurText
  text="A HulianUI title coming into focus"
  splitType="char"
  direction="bottom"
  className="text-3xl font-bold text-primary"
/>
```

## Usage guidelines

- `text` accepts a plain string, not JSX.
- With languages that do not separate words with spaces, `splitType="word"` may reveal the whole sentence at once. Pass `splitType="char"` for a character-by-character effect.
- The reveal runs only once when the visible ratio reaches `threshold`. Change `key` to force a remount if it must run again.
- When `prefers-reduced-motion` is enabled, the component renders directly in its final clear state.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
