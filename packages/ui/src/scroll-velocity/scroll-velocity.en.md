---
slug: scroll-velocity
name: ScrollVelocity
category: typography
group: text
tags: [animated]
exports: [ScrollVelocity]
status: enriched
---

# ScrollVelocity

> Scroll-reactive ticker · alternating multiline parallax + velocity-based acceleration and direction + constant idle drift · Motion value driver + reduced-motion fallback · typography/text · #animated

## When to use

Use ScrollVelocity for horizontal multiline marquees whose alternating rows accelerate with page scroll velocity. Use CurvedLoop for a single marquee following a curved path; ScrollVelocity specializes in straight ticker rows with scroll-reactive speed and direction.

## Import
```ts
import { ScrollVelocity } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| texts | `string[]` | `[]` | Multi-line scrolling text, each line has an independent ticker; even lines move to the left/odd lines move to the right to create parallax |
| velocity | `number` | `100` (showcase `80`) | Base speed in px/s. Rows drift even when the page is still; negative values reverse all directions. |
| damping | `number` | `50` | Spring damping for velocity changes; higher values respond more slowly and steadily. |
| stiffness | `number` | `400` | Spring stiffness; higher values follow scroll velocity more tightly. |
| numCopies | `number` | `6` | Copies per row for seamless looping; shorter text requires more copies. |
| velocityMapping | `{ input: [number, number]; output: [number, number] }` | `{ input: [0,1000], output: [0,5] }` | Scroll speed → acceleration factor mapping (clamp:false allows extrapolation) |
| scrollContainerRef | `RefObject<HTMLElement \| null>` | window | Custom scroll container; do not pass monitoring window scrolling |
| className | `string` | - | Transparently transmit the className (font size/color/weight) of each line of text span |
| containerClassName | `string` | - | Transparently transmit the className of the root section |
| parallaxStyle | `CSSProperties` | - | Transparently transmit the inline style of the outer (parallax) container of each row |
| scrollerStyle | `CSSProperties` | - | Transparently transmit the scroll rail (scroller) inline style of each row |

## Example
```tsx
// Single row uniform drift
<ScrollVelocity texts={["HulianUI component library"]} velocity={80} />

// Two rows alternating directions (parallax)
<ScrollVelocity texts={["Enterprise-ready · high quality", "Responsive · theme-aware"]} velocity={70} />
```

## Usage guidelines

- Shorter text needs a larger `numCopies`; too few copies expose gaps wider than the viewport.
- `className` styles each row's text, while `containerClassName` styles the root. Keep the two scopes distinct.
- Window scrolling is monitored by default. Pass `scrollContainerRef` inside a custom scroll area or the velocity sensor will observe the wrong source.
- Reduced-motion mode disables scroll acceleration but retains constant drift and the same readable DOM.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
