---
slug: ripple
name: Ripple
category: decoration
group: backdrop
tags: [animated]
exports: [Ripple]
status: enriched
---

# Ripple

> Concentric pulsing rings · CSS circle-by-turn delay + reduced-motion · decoration/backdrop · #animated

## When to Use

Concentric pulses radiating outward from the center (radar scan, signal broadcast, CTA focus ambience). If you want a pulse ring, use this component; if you want a static radial glow, use [Spotlight](../spotlight/spotlight.md); if you want a regular texture, use [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md).

## Import
```ts
import { Ripple } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| mainCircleSize | `number` | `210` | Innermost ring diameter px |
| mainCircleOpacity | `number` | `0.24` | Innermost circle opacity |
| numCircles | `number` | `8` | Number of rings |

> Inherited from `ComponentPropsWithoutRef<"div">`. The color is `currentColor` and controlled by the `text-*` tool class.

## Examples
```tsx
<div className="relative grid place-items-center overflow-hidden">
  <Ripple mainCircleSize={160} />
</div>

<Ripple mainCircleSize={140} numCircles={5} className="text-primary" />
```

## Usage Guidelines

- The internal `absolute inset-0` is filled with the parent and must be placed in the `relative` positioning container. It is usually equipped with `grid place-items-center` to allow the pulse to spread from the center of the content.
- Rings use staggered CSS animation and stop under `prefers-reduced-motion`.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Meteors](../meteors/meteors.md)
