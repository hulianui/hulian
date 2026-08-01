---
slug: circular-text
name: CircularText
category: typography
group: text
tags: [animated]
exports: [CircularText]
status: enriched
---

# CircularText

> Circular text · Evenly spaced characters around a rotating ring, with hover speed controls, currentColor inheritance, and reduced-motion support · typography/text · #animated

## When to use

Use CircularText for a badge, seal, or rotating logo that places characters evenly around a circle and adjusts speed on hover. Use [SplitText](../split-text/split-text.md) for a staggered character reveal, [GlitchText](../glitch-text/glitch-text.md) for a torn glitch effect, or [Heading](../heading/heading.md) for a static title.

## Import
```ts
import { CircularText } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| text * | `string` | — | Text to wrap around the ring. Add a trailing separator such as `✦` for a smoother join between the end and start. |
| spinDuration | `number` | `20` | Seconds per full rotation. |
| onHover | `"speedUp" \| "slow" \| "pause" \| "goBonkers"` | `"speedUp"` | Hover behavior: accelerate, slow down, pause, or spin rapidly. |
| radius | `number` | `80` | Ring radius in pixels. |

All other native `<div>` attributes are supported. Text inherits `currentColor`, so use a `text-*` utility or a parent color to style it.

## Examples
```tsx
<CircularText
  text="HulianUI · HULIAN UI · Design System ·"
  className="text-sm font-semibold tracking-widest text-primary"
/>

<CircularText
  text="★ HULIAN ★ STUDIO ★ "
  spinDuration={14}
  onHover="goBonkers"
  radius={64}
  className="text-xs font-bold tracking-[0.2em] text-background"
/>
```

## Usage guidelines

- The start and end of `text` meet to form a loop. Add a trailing separator such as ` · `, `✦`, or `★` so the final and first words do not run together.
- Color comes from `currentColor`; set it with a `text-*` class or a parent color. There is no separate color prop.
- When `prefers-reduced-motion` is enabled, the ring remains static.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
