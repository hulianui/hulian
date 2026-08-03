---
slug: glare-hover
name: GlareHover
category: decoration
group: overlay-fx
tags: [animated]
exports: [GlareHover]
status: enriched
---

# GlareHover

> Reflective hover · hover diagonal sweep + reduced-motion + RSC · decoration/overlay-fx · #animated

## When to Use

Use it when you want the card/button/tile to be swept by an oblique glass reflection when hovering (exquisite feeling, interactive hint). It is a wrapper container that passes in the content to be reflected as `children` and accepts all native `div` properties. If you want a continuous light spot on the border, use [BorderBeam](../border-beam/border-beam.md); if you want the entire border streamer, use [ShineBorder](../shine-border/shine-border.md); if you want to hover to enlarge the content, use [Lens](../lens/lens.md).

## Import
```ts
import { GlareHover } from "@hulianui/ui"
```

## Props

Inherits all native `div` properties (`ComponentPropsWithoutRef<"div">`), plus:

| Name | Type | Default | Description |
|------|------|------|------|
| glareColor | `string` | Translucent white | Reflective color, default glass gloss (suitable for both light and dark) |
| duration | `string` | `"650ms"` | Sweep duration; showcase options are `"450ms"`, `"650ms"`, and `"1000ms"` |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Content swept by reflections |

## Examples

```tsx
<GlareHover className="grid h-40 w-72 place-items-center rounded-xl border bg-surface">
<span className="text-lg font-semibold">Hover to see the reflection </span>
</GlareHover>
```

```tsx
<GlareHover duration="1000ms" className="rounded-xl p-6">
  <Card>...</Card>
</GlareHover>
```

## Usage Guidelines

- Sweeping light is weakened/disabled under reduced-motion preferences. Do not put key information only in reflective animations.
- It's a wrapper not an overlay - give it the layout/style className directly, no extra `relative` container required.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md) · [ProgressiveBlur](../progressive-blur/progressive-blur.md)
