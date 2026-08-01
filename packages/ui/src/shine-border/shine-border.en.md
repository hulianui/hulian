---
slug: shine-border
name: ShineBorder
category: decoration
group: overlay-fx
tags: [animated]
exports: [ShineBorder]
status: enriched
---

# ShineBorder

> Streamer border · Gradient mask leaving only border area + chart token + RSC · decoration/overlay-fx · #animated

## When to Use

Use it when you want the entire border of the card/container to continuously flow gradient streamer (pure CSS, can be rendered on the RSC server). It is an absolute positioning cover that can be placed into the `relative` container. If you want a light point to go around the edge instead of a full-edge streamer, use [BorderBeam](../border-beam/border-beam.md); if you want to hover a light point diagonally and sweep a reflection, use [GlareHover](../glare-hover/glare-hover.md).

## Import
```ts
import { ShineBorder } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| borderWidth | `number` | `1` | Border width px |
| duration | `number` | `14` | Duration of one gradient cycle in seconds |
| shineColor | `string \| string[]` | Hulian chart token | Streamer color, single color or multi-color array |
| className | `string` | — | Additional class name for the overlay |
| style | `CSSProperties` | — | Inline styles forwarded to the overlay |

## Examples

```tsx
<div className="relative overflow-hidden rounded-xl bg-surface">
  ...content
  <ShineBorder />
</div>
```

```tsx
// thick edge · solid color
<div className="relative rounded-xl bg-surface">
  ...content
  <ShineBorder borderWidth={2} shineColor="var(--color-primary)" />
</div>
```

## Usage Guidelines

- Must be placed in the `position:relative` container, otherwise the border will be positioned incorrectly.
- `shineColor` feeding token needs to be prefixed with `--color-`, and bare `var(--primary)` will not be parsed - see [[hulian-token-color-var-needs-color-prefix]].
- Pure CSS implementation, can be used directly in RSC, no need for `"use client"`.

## Related
[BorderBeam](../border-beam/border-beam.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md) · [ProgressiveBlur](../progressive-blur/progressive-blur.md)
