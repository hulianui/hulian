---
slug: cubes
name: Cubes
category: decoration
group: overlay-fx
tags: [animated]
exports: [Cubes]
status: enriched
---

# Cubes

> Cube Array · 3D Cube Array Interactive Background · When the pointer approaches, it will attenuate and tilt according to distance + Idle automatic wandering + Click to highlight the circular ripples (zero dependence on gsap·token color matching·reduced-motion) · decoration/overlay-fx · #animated

## When to Use

Use it when you need a grid background/decorative panel with a 3D feel that responds to pointer tilt. It is suitable for visual embellishment of hero areas, empty consoles, and active landing pages. It is a regular grid array; if you want a softer particle/spot type atmosphere background, look at other effects background components; if you want a single element to hover and emit light, use [GlareHover](../glare-hover/glare-hover.md).

## Import
```ts
import { Cubes } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| gridSize | `number` | `8` | Grid side length (row = column), generate gridSize² cubes; DOM is square level, recommended ≤ 12 |
| cubeSize | `number` | — | Single cube side length (px); when passed in, the container has a fixed size, otherwise the container will adapt (width 100%·1:1) |
| maxAngle | `number` | `45` | The maximum tilt angle of the cube at the pointer (degrees), the closer it is, the bigger it is and the farther it is, the closer it is to 0 |
| radius | `number` | `3` | Tilt influence radius (in "grid"), participate in tilt within the range, and return to normal outside |
| cellGap | `number \| { row?: number \| string; col?: number \| string }` | `"5%"` | Unit spacing, numbers in px, objects specify rows and columns respectively (percentage strings scale with the container) |
| faceColor | `string` | `var(--color-surface)` | Cube face background color, must be prefixed with `--color-` |
| edgeColor | `string` | `var(--color-border)` | Cube surface border color |
| rippleColor | `string` | `var(--color-primary)` | The ripple highlight color that spreads outward from the hit point when clicked |
| rippleSpeed | `number` | `2` | Ripple diffusion speed multiplier, the bigger the faster |
| autoAnimate | `boolean` | `true` | Whether to automatically wander and tilt when idle (automatically disabled to remain stationary under reduced-motion) |
| rippleOnClick | `boolean` | `true` | Whether to enable click ripples |
| className | `string` | — | Forward the additional class name of the root container |
| style | `CSSProperties` | — | Forward the root container inline style |

## Examples
```tsx
// Default 8×8, size constrained by parent container
<div className="h-56 w-56">
  <Cubes />
</div>

// Brand color ripple + acceleration (click to try)
<Cubes
  gridSize={8}
  faceColor="var(--color-surface)"
  edgeColor="var(--color-primary)"
  rippleColor="var(--color-chart-2)"
  rippleSpeed={3}
/>
```

## Usage Guidelines

- When `cubeSize` is omitted, the container uses a responsive 1:1 aspect ratio. Give its parent explicit dimensions, for example with a fixed-width, fixed-height wrapper, or the container may collapse.
- All color props (faceColor/edgeColor/rippleColor) must be tokenized with the `--color-` prefix. See [[hulian-token-color-var-needs-color-prefix]].
- The number of DOMs is `gridSize²`. Don’t set `gridSize` too large (recommended ≤ 12), otherwise the number of nodes and rearrangement costs will soar.
- Under reduced-motion, `autoAnimate` automatically fails and the cube becomes stationary.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
