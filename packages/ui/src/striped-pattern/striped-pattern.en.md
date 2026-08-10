---
slug: striped-pattern
name: StripedPattern
category: decoration
group: backdrop
tags: []
exports: [StripedPattern]
status: enriched
---

# StripedPattern

> Diagonal stripe background · Pure CSS gradient + currentColor · decoration/backdrop

## When to Use

Apply diagonal stripe shading to the area (warning strips/construction sense/texture separation). Use this component for stripes; [DotPattern](../dot-pattern/dot-pattern.md) for dots, [GridPattern](../grid-pattern/grid-pattern.md) for line grids, and [Spotlight](../spotlight/spotlight.md) for radial glow.

## Import
```ts
import { StripedPattern } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| angle | `number` | `45` | Stripe angle (degrees) |
| size | `number` | `10` | Width in pixels of one stripe-and-gap unit |

> Inherited from `ComponentPropsWithoutRef<"div">`. The color is `currentColor` and controlled by the `text-*` tool class.

## Examples
```tsx
<div className="relative h-48 overflow-hidden rounded-xl border">
  <StripedPattern />
</div>

<StripedPattern angle={90} size={20} className="text-muted-foreground" />
```

## Usage Guidelines

- Internal `absolute inset-0` is parented and must be placed inside a `relative` (and usually `overflow-hidden`) positioning container.
- The color depends on `currentColor`, and `text-*` is used to change the color.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md) · [Meteors](../meteors/meteors.md)
