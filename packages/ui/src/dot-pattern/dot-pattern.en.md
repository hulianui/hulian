---
slug: dot-pattern
name: DotPattern
category: decoration
group: backdrop
tags: []
exports: [DotPattern]
status: enriched
---

# DotPattern

> Draws a token-colored repeating dot background with an SVG pattern. · decoration/backdrop

## When to Use

Add a dot matrix texture base to the card/block/Hero. Use this component for dotted textures; use [GridPattern](../grid-pattern/grid-pattern.md) for line grids, [StripedPattern](../striped-pattern/striped-pattern.md) for diagonal stripes, and [Spotlight](../spotlight/spotlight.md) for radial glow.

## Import
```ts
import { DotPattern } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| width | `number` | `16` | Tile unit width |
| height | `number` | `16` | Tile unit height |
| cx | `number` | `1` | The x offset of the point within the cell |
| cy | `number` | `1` | The y offset of the point within the cell |
| cr | `number` | `1` | Point Radius |
| x | `number` | `0` | pattern overall x offset |
| y | `number` | `0` | pattern overall y offset |

> Inherits `ComponentPropsWithoutRef<"svg">` (`className`, etc.). The color is `currentColor`, which is controlled by the `text-*` tool class (such as `text-muted-foreground`).

## Examples
```tsx
<div className="relative h-48 overflow-hidden rounded-xl border">
  <DotPattern />
</div>

<DotPattern width={28} height={28} cr={1.4} className="text-muted-foreground" />
```

## Usage Guidelines

- The internal `absolute inset-0` is filled with the parent and must be placed inside the `relative` (and usually `overflow-hidden`) positioning container, otherwise it cannot be positioned/will overflow.
- The color depends on `currentColor`, use `text-*` to change the color instead of `fill`.

## Related
[GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md) · [Meteors](../meteors/meteors.md)
