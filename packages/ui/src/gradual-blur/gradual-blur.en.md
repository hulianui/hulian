---
slug: gradual-blur
name: GradualBlur
category: decoration
group: overlay-fx
tags: [animated]
exports: [GradualBlur]
status: enriched
---

# GradualBlur

> Edge blur · Layers multiple backdrop filters along one side of a container for a progressive fade · Eight directions, easing curves, exponential strength, hover enhancement, and fade-in · decoration/overlay-fx · #animated

## When to Use

Attach it to an edge of a scroller or image wall to soften content as it approaches the boundary, often at the top or bottom of a long list. It uses `backdrop-filter` to blur underlying content instead of drawing an opaque mask. Use [BorderBeam](../border-beam/border-beam.md) for a decorative border highlight. The parent must be positioned with `relative`.

## Import
```ts
import { GradualBlur } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| position | `"top"｜"bottom"｜"left"｜"right"` | `"bottom"` | The side where the fuzzy bar abuts; top/bottom are horizontal bars, left/right are vertical bars |
| strength | `number` | `2` | Blur strength base, each layer increases according to the curve, recommended 1–6 |
| height | `string` | `"6rem"` | Horizontal bar thickness; if width is not passed in vertical bar mode, this value will be reused as vertical bar width |
| width | `string` | — | Vertical bar (left/right) width, the default falls back to `height` |
| divCount | `number` | `5` | The more blur layers you add, the more delicate the transition will be and the more performance you will need. It is recommended 3–10 |
| exponential | `boolean` | `false` | Exponentially increasing blur amount (near edges become blurry sharply), false=linear |
| curve | `"linear"｜"bezier"｜"ease-in"｜"ease-out"｜"ease-in-out"` | `"linear"` | The climbing curve of the blur amount of each layer along the progress |
| opacity | `number` | `1` | Overall opacity |
| hoverIntensity | `number` | — | Blur multiplier on hover. Providing it enables pointer events; when omitted, the overlay does not block interaction |
| revealOnScroll | `boolean` | `false` | Fade in when entering the viewport (IntersectionObserver driver), invisible by default when turned on |
| duration | `string` | `"0.3s"` | Fade-in transition duration, only valid for `revealOnScroll` |
| zIndex | `number` | `10` | Overlaid z-index |
| className | `string` | — | Root container additional className |
| style | `CSSProperties` | — | Forward the root container inline style (merged with the internal calculation style, the same name shall prevail) |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Content covered on the blur layer (such as edge title/operation bar) |

## Examples
```tsx
<div className="relative h-64 overflow-hidden rounded-xl bg-surface">
{/* ...scrolling content... */}
  <GradualBlur position="bottom" height="7rem" />
</div>
```

Strong blur at the top, exponential increase:
```tsx
<GradualBlur position="top" height="8rem" strength={4} divCount={8} exponential />
```

## Usage Guidelines

- Working with `backdrop-filter`: If the ancestor element itself carries `filter` / `backdrop-filter` / `transform`, a new containing block will be created, and the fixed/absolute positioning of the blur layer may be misaligned and invalid, see [[backdrop-filter-ancestor-breaks-fixed-overlay-centering]].
- When `hoverIntensity` is omitted, the container uses `pointer-events: none`, allowing interaction with content underneath. Providing it enables pointer handling, so avoid covering clickable content.
- When `width` is not passed, the vertical bar width reuses the `height` value. This is an intentional design. Do not mistake it for a bug.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
