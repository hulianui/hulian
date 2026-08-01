---
slug: retro-grid
name: RetroGrid
category: decoration
group: backdrop
tags: [animated]
exports: [RetroGrid]
status: enriched
---

# RetroGrid

> Retro perspective grid · CSS scroll + reduced-motion · decoration/backdrop · #animated

## When to Use

Perspective scrolling grid horizon creating a synthwave/cyberpunk vibe. If you want a dynamic perspective grid, use this component; if you want a static tile grid, use [GridPattern](../grid-pattern/grid-pattern.md), and if you want a dotted grid, use [DotPattern](../dot-pattern/dot-pattern.md).

## Import
```ts
import { RetroGrid } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| angle | `number` | `65` | Perspective tilt angle (degrees) |
| cellSize | `number` | `60` | Grid unit pixels |
| opacity | `number` | `0.5` | Overall opacity |
| duration | `number` | `12` | Duration of one scroll cycle in seconds; higher values move more slowly |

> Inherited from `ComponentPropsWithoutRef<"div">`. The color is `currentColor` and controlled by the `text-*` tool class.

## Examples
```tsx
<div className="relative h-56 overflow-hidden rounded-xl border">
  <RetroGrid />
</div>

<RetroGrid cellSize={36} duration={24} className="text-primary" />
```

## Usage Guidelines

- The inner `absolute inset-0` is parented and must be placed inside a `relative` (and usually `overflow-hidden`) positioning container.
- Contains CSS scroll animation, with built-in `prefers-reduced-motion` degradation (the system stops scrolling when "Reduce Dynamic Effects" is turned on).

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [Ripple](../ripple/ripple.md) · [Meteors](../meteors/meteors.md)
