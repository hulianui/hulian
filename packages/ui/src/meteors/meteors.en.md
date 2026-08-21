---
slug: meteors
name: Meteors
category: decoration
group: backdrop
tags: [animated]
exports: [Meteors]
status: enriched
---

# Meteors

> Meteor shower · Random falling trail (client generated) + currentColor · decoration/backdrop · #animated

## When to Use

Use it when you need to stack a layer of falling meteors in the Hero/card/empty state container to embellish the atmosphere. It is a lightweight pure DOM animation (no canvas/WebGL), suitable for small foreground decorations; if you want a continuous dynamic background that covers the entire screen, select [Aurora](../aurora/aurora.md) / [WavyBackground](../wavy-background/wavy-background.md); if you want a regular geometric shading (lattice/grid), select [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md).

## Import
```ts
import { Meteors } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| number | number | 20 | Number of meteors |
| minDelay | number | 0.2 | Minimum delay for single animation start (seconds) |
| maxDelay | number | 1.2 | Maximum delay before one animation starts (seconds) |
| minDuration | number | 2 | Minimum fall duration (seconds) |
| maxDuration | number | 10 | Maximum fall duration (seconds) |
| angle | number | 215 | Falling angle (degrees) |
| className | string | - | Extra class passed through to each meteor span (the meteor itself uses currentColor, which can be used to adjust the color) |

## Examples
```tsx
// The parent must be relative and clip overflow.
<div className="relative overflow-hidden rounded-xl border">
  <Meteors number={20} />
  <div className="grid h-48 place-items-center text-sm text-muted-foreground">Meteors</div>
</div>
```

## Usage Guidelines

- The meteor position/delay is randomly generated on the client side, the component must be rendered on the client side, and the position is not determined before the first frame (the SSR will be one frame different from the first screen). Do not use it in places sensitive to the pixel stability of the first screen.
- The color of the meteor is `currentColor`, which is colored by the parent `text-*` or `className` without passing the color prop.
- The parent container needs `position: relative` + `overflow-hidden`, otherwise the meteor will overflow outside the container.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
