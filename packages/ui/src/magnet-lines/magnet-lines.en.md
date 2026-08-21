---
slug: magnet-lines
name: MagnetLines
category: decoration
group: overlay-fx
tags: [animated]
exports: [MagnetLines]
status: enriched
---

# MagnetLines

> Pointer-driven magnetic-field grid · `rows × columns` line segments rotate toward the pointer in real time + token-aware color (zero dependencies · reduced-motion static state) · decoration/overlay-fx · #animated

## When to Use

Lay out a grid of thin line segments and turn each line segment to point to the mouse in real time, creating a magnetic field/compass-style minimalist interactive decoration. It is a lightweight solution of pure CSS transform (without WebGL). Compared with WebGL-heavy backgrounds such as [GhostCursor](../ghost-cursor/ghost-cursor.md) / [LaserFlow](../laser-flow/laser-flow.md), it is lighter and more suitable for small graphic embellishments. The container is square and occupies `80vmin` by default.

## Import
```ts
import { MagnetLines } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| rows | `number` | `9` | Number of grid rows; `rows × columns` determines the total number of segments |
| columns | `number` | `9` | Number of grid columns |
| containerSize | `string` | `"80vmin"` | Container size (any CSS length), square, with segments spread equally across it |
| lineColor | `string` | `var(--color-foreground)` | Line segment color, light and dark theme; any CSS color string can be used |
| lineWidth | `string` | `"1vmin"` | Single line segment width (any CSS length) |
| lineHeight | `string` | `"6vmin"` | Single line segment height (any CSS length) |
| baseAngle | `number` | `-10` | Initial rest angle (degrees); maintain this angle when the pointer does not move or reduces-motion |
| className | `string` | - | Additional class name for the root container |
| style | `CSSProperties` | - | Inline styles for the root container, merged after the computed grid styles |

## Examples
```tsx
<MagnetLines containerSize="16rem" lineColor="var(--color-foreground)" />
```

Fine mesh + brand colors:
```tsx
<MagnetLines
  rows={13}
  columns={13}
  containerSize="16rem"
  lineWidth="0.4rem"
  lineHeight="2rem"
  lineColor="var(--color-chart-1)"
/>
```

## Usage Guidelines

- `rows × columns` is the number of DOM line segment nodes (default 81). Too large a grid will drag down the rendering. Control the density as needed.
- All line segments under reduced-motion are fixed at `baseAngle` and no longer follow the mouse.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
