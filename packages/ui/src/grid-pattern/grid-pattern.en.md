---
slug: grid-pattern
name: GridPattern
category: decoration
group: backdrop
tags: []
exports: [GridPattern]
status: enriched
---

# GridPattern

> Grid background · Pure SVG line + dotted line optional + currentColor · decoration/backdrop

## When to Use

Give the block a line grid texture (technical feel/blueprint feel). Use this component for line grids; use [DotPattern](../dot-pattern/dot-pattern.md) for dotted textures, [StripedPattern](../striped-pattern/striped-pattern.md) for diagonal stripes, and [RetroGrid](../retro-grid/retro-grid.md) for retro grids with perspective scrolling.

## Import
```ts
import { GridPattern } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| width | `number` | `40` | Unit width |
| height | `number` | `40` | Unit height |
| x | `number` | `0` | pattern x offset |
| y | `number` | `0` | pattern y offset |
| strokeDasharray | `string \| number` | `0` | Grid-line dash pattern; `0` is solid, while a value such as `"4 2"` creates dashes |

> Inherited from `ComponentPropsWithoutRef<"svg">`. The color is `currentColor`, which is controlled by the `text-*` tool class.

## Examples
```tsx
<div className="relative h-48 overflow-hidden rounded-xl border">
  <GridPattern />
</div>

<GridPattern width={24} height={24} strokeDasharray="3 2" className="text-muted-foreground" />
```

## Usage Guidelines

- The inner `absolute inset-0` overlay parent must be placed inside a `relative` (and usually `overflow-hidden`) positioning container.
- The color depends on `currentColor`, use `text-*` to change the color.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md) · [Meteors](../meteors/meteors.md)
