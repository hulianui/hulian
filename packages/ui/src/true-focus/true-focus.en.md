---
slug: true-focus
name: TrueFocus
category: typography
group: text
tags: [animated]
exports: [TrueFocus]
status: enriched
---

# TrueFocus

> Moving word focus · one sharp word among blurred neighbors + cycling four-corner frame + hover-driven manual mode + fully clear reduced-motion fallback · typography/text · #animated

## When to use

Use TrueFocus to scan a short sentence word by word, keeping the active word sharp while a corner frame follows it and the others remain blurred. Use [BlurText](../blur-text/blur-text.md) for a one-time blur reveal without a frame, [ScrollReveal](../scroll-reveal/scroll-reveal.md) for scroll-linked progress, or [Heading](../heading/heading.md) for static titles.

## Import
```ts
import { TrueFocus } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| sentence | `string` | `"True Focus"` | For the entire sentence text, press `separator` to segment the words and focus on each word. |
| separator | `string` | `" "` | Word segmentation separator (passed to `String.prototype.split`) |
| blurAmount | `number` | `5` | Blur radius of out-of-focus words (px) |
| borderColor | `string` | `"var(--color-chart-1)"` | Square bracket stroke color (CSS color, token is recommended), must have `--color-` prefix or legal CSS color |
| animationDuration | `number` | `1.2` | Animation/dwell seconds of single focus switch |
| pauseBetweenAnimations | `number` | `0.6` | Pause between switches in automatic mode (seconds) |
| manualMode | `boolean` | `false` | When true, the carousel will not be automatically rotated, and a word will be focused by hovering the mouse. |

The remaining `<div>` native attributes are transparently transmitted.

## Example
```tsx
<TrueFocus sentence="True Focus Effect" className="text-3xl font-bold text-foreground" />

<TrueFocus
  sentence="HulianUI true focus"
  borderColor="var(--color-primary)"
  blurAmount={6}
  className="text-3xl font-bold text-foreground"
/>
```

## Usage guidelines

- The corner frame is positioned from each word's measured rectangle. Provide enough layout space, preferably a fixed-height container, to avoid wrapping or compression that misaligns the frame.
- `borderColor` must be prefixed with `--color-` or a legal CSS color; bare `var(--primary)` will not be parsed under this Tailwind v4 setting.
- Under `prefers-reduced-motion`, every word remains clear and focus does not cycle.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
