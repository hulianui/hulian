---
slug: progressive-blur
name: ProgressiveBlur
category: decoration
group: overlay-fx
tags: []
exports: [ProgressiveBlur]
status: enriched
---

# ProgressiveBlur

> Progressive blur · Layered backdrop-blur + mask gradient (pure CSS·RSC) · decoration/overlay-fx

## When to Use

Use it to feather one edge of an image wall, long list, or horizontal scroller with a progressive blur overlay. For animated borders, use [BorderBeam](../border-beam/border-beam.md) or [ShineBorder](../shine-border/shine-border.md); for pointer glare, use [GlareHover](../glare-hover/glare-hover.md); for magnification, use [Lens](../lens/lens.md).

## Import
```ts
import { ProgressiveBlur } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| side | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | The direction of blur enhancement, this side is the most blurry. |
| layers | `number` | `5` | Number of layers; more layers produce a smoother transition |
| blur | `number` | `1` | Base blur in pixels, doubled for each successive layer |
| className | `string` | — | Passthrough to the root overlay. |

## Examples
```tsx
<div className="relative overflow-hidden">
  {/* content */}
  <ProgressiveBlur side="bottom" />
</div>
```

## Usage Guidelines

- The parent container must be `position: relative` and `overflow-hidden`, and the overlay must be absolutely positioned to cover this side, otherwise the blur layer will overflow or be positioned incorrectly.
- Depends on `backdrop-filter`, it needs to be applied on the same layer with actual content to see the effect (there is nothing blurry on the empty background).

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
