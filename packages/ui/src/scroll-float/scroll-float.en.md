---
slug: scroll-float
name: ScrollFloat
category: typography
group: text
tags: [animated]
exports: [ScrollFloat]
status: enriched
---

# ScrollFloat

> Scroll-driven heading reveal · characters rise from a lowered, stretched, flattened, transparent state · Motion `useScroll`/`useTransform` + foreground token + reduced-motion fallback · typography/text · #animated

## When to use

Use ScrollFloat for large section headings that should deform and rise character by character as the page scrolls. Use Reveal for a general block-level entrance, or AuroraText for a continuously glowing gradient heading.

## Import
```ts
import { ScrollFloat } from "@hulianui/ui"
```

## Props

Accepts `h2` props except Motion-conflicting `onDrag*`, `onAnimationStart`, and `children`.

| Name | Type | Default | Description |
|------|------|------|------|
| scrollContainerRef | `RefObject<HTMLElement \| null>` | Auto-detected | Custom scroll container. By default, the nearest scrollable ancestor is used, then the viewport. Without any scroll context, the heading reveals automatically when entering the viewport. |
| offset | `[string, string]` | `["start 0.9", "start 0.35"]` | Progress mapping interval (corresponding to useScroll offset): start at 90% of the viewport and complete at 35% |
| stagger | `number` | `0.4` | Peak stagger intensity between characters (0~1), offset ratio of each character progress window relative to the overall |
| yPercent | `number` | `120` | Initial sinking displacement percentage (relative word height), returns to 0 with progress |
| scaleY | `number` | `2.3` | Initial longitudinal stretch ratio, returns to 1 with progress |
| scaleX | `number` | `0.7` | Initial transverse flattening magnification, returns to 1 with progress |
| containerClassName | `string` | - | Outer container class name (clipping overflow scrolling display) |
| textClassName | `string` | - | Text layer class name (control font size/weight/alignment) |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `string` | Scroll the floating text character by character (strings only, non-strings are ignored) |

## Example
```tsx
// Automatically binds to the nearest scrollable ancestor
<div className="max-h-72 overflow-auto p-6">
  <div className="h-40" />
  <ScrollFloat>Hulian component library</ScrollFloat>
  <div className="h-56" />
</div>

// Strong staggered peak + main color headline
<ScrollFloat stagger={0.7} textClassName="text-primary text-3xl md:text-5xl">HULIAN</ScrollFloat>
```

## Usage guidelines

- `children` must be a string. Non-string content is treated as empty because per-character splitting depends on plain text.
- Scroll-linked playback requires a scrollable context. The nearest scrollable ancestor is detected automatically; without one, the component reveals on viewport entry so it cannot remain invisibly stuck at zero progress.
- Reduced-motion mode renders the clear heading directly without deformation.

## Related
[Text](../text/text.md) · [Heading](../heading/heading.md) · [Prose](../prose/prose.md) · [Markdown](../markdown/markdown.md) · [AuroraText](../aurora-text/aurora-text.md) · [AnimatedShinyText](../animated-shiny-text/animated-shiny-text.md)
