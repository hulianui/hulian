---
slug: orbiting-circles
name: OrbitingCircles
category: decoration
group: overlay-fx
tags: [animated]
exports: [OrbitingCircles]
status: enriched
---

# OrbitingCircles

> Circular orbit · Child elements revolve at a constant speed while counter-rotating to remain upright (pure CSS · RSC-safe) · decoration/overlay-fx · #animated

## When to Use

Use it to revolve icons or avatars around a center point at a constant speed, such as a technology-stack or brand ecosystem display. Children are distributed evenly around the circumference and counter-rotate to remain upright. Stack instances with different `radius` and `duration` values for multiple tracks. To connect specific nodes with a moving beam, use [AnimatedBeam](../animated-beam/animated-beam.md).

## Import
```ts
import { OrbitingCircles } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| radius | `number` | `150` | Orbit radius in pixels |
| duration | `number` | `20` | Duration of one revolution in seconds |
| reverse | `boolean` | `false` | Reverse rotation |
| iconSize | `number` | `40` | Child element box size in pixels |
| showPath | `boolean` | `true` | Whether to draw a dotted orbital circle |
| className | `string` | — | Additional class name for the root element |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Surrounded child elements (icons, etc.), evenly distributed to the circumference by number |

## Examples

```tsx
// Two tracks rotating in opposite directions.
<div className="relative flex size-[340px] items-center justify-center">
  <span className="text-sm font-medium text-muted-foreground">Hulian</span>
  <OrbitingCircles radius={140} duration={20}>
    <Icon /><Icon /><Icon /><Icon />
  </OrbitingCircles>
  <OrbitingCircles radius={80} duration={14} reverse iconSize={32}>
    <Icon /><Icon />
  </OrbitingCircles>
</div>
```

## Usage Guidelines

- Place it in a centered `relative` container, and the container size needs to be ≥ 2×radius, otherwise the track will be cut.
- Pure CSS implementation, can be used directly in RSC without `"use client"`.
- Under the reduced-motion preference, the revolution will be weakened/stopped. Do not use it as the only information carrier.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [ProgressiveBlur](../progressive-blur/progressive-blur.md)
