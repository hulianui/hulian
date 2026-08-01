---
slug: lens
name: Lens
category: decoration
group: overlay-fx
tags: [animated]
exports: [Lens]
status: enriched
---

# Lens

> Magnifying glass · Hover the cursor in a circle to enlarge any children (zero dependency mask+scale) · decoration/overlay-fx · #animated

## When to Use

Use it to magnify a local area of product imagery, maps, screenshots, or arbitrary `children` through a circular pointer-following lens. It has no runtime dependency beyond its mask-and-scale implementation. Use [GlareHover](../glare-hover/glare-hover.md) for a diagonal reflection, or [BorderBeam](../border-beam/border-beam.md) and [ShineBorder](../shine-border/shine-border.md) for border lighting.

## Import
```ts
import { Lens } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| zoom | `number` | `1.6` | Magnification |
| size | `number` | `140` | Lens diameter in pixels |
| className | `string` | — | Forwarding className |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Amplified content (usually `<img>`) |

## Examples

```tsx
<Lens zoom={1.8} className="w-80 rounded-[var(--radius)] border">
<img src="/photo.jpg" alt="Forest" className="block aspect-[4/3] w-full object-cover" />
</Lens>
```

## Usage Guidelines

- It needs to be triggered by pointer hover. There is no magnification effect in pure touch screen/keyboard scenarios. Do not use it as the only way to view details.
- `children` must be visual content with a certain size that can be scaled (such as `<img>` of `block`), otherwise the lens magnification area will be empty.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md) · [ProgressiveBlur](../progressive-blur/progressive-blur.md)
