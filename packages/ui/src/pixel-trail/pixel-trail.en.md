---
slug: pixel-trail
name: PixelTrail
category: decoration
group: overlay-fx
tags: [animated]
exports: [PixelTrail]
status: enriched
---

# PixelTrail

> Pixel afterglow trail · Pointer-lit grid cells fade over time · CPU trail buffer + ogl data-texture rendering + optional gooey fusion (ogl · tokens · reduced-motion support) · decoration/overlay-fx · #animated

## When to Use

Use it for a retro interactive background where pointer movement lights grid cells that fade into an afterglow. Choose hard-edged pixels or merge neighboring cells into gooey blobs. For fluid splashes, use [SplashCursor](../splash-cursor/splash-cursor.md); for elastic ribbons, use [Ribbons](../ribbons/ribbons.md).

## Import
```ts
import { PixelTrail } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| gridSize | `number` | `40` | The number of horizontal pixel grids (vertically calculated automatically in proportion to maintain the square grid), recommended 16-120 |
| trailSize | `number` | `0.1` | Trailing influence radius (ratio of the short side of the container 0-1), the larger the tail, the thicker the trailing |
| maxAge | `number` | `320` | The survival time of a single cell after it is lit (ms), the larger the value, the longer the afterglow |
| color | `string` | `var(--color-chart-1)` | Pixel color, token must be prefixed with `--color-` |
| gooey | `boolean` | `false` | Enable slime filter: adjacent points merge into a liquid blob instead of a hard-edged square |
| gooeyStrength | `number` | `8` | gooey fusion strength (Gaussian blur radius px), only effective when gooey=true |
| className | `string` | - | Additional class name for the root container, which defaults to `block h-full w-full` |
| style | `CSSProperties` | - | Passthrough to root container |

## Examples
```tsx
// Default pixel trail; the container must be relative and clip overflow.
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <PixelTrail className="absolute inset-0" />
</div>
```
```tsx
// gooey slime fusion + custom color
<PixelTrail gridSize={48} trailSize={0.14} gooey gooeyStrength={9}
  color="var(--color-chart-1)" className="absolute inset-0" />
```

## Usage Guidelines

- The `color` feeding token must be prefixed with `--color-`, and the bare `var(--primary)` shader will not parse it. See [[hulian-token-color-var-needs-color-prefix]].
- WebGL/ogl component, client-side rendering only; StrictMode double-mounted canvas context reuse risk, see [[webgl-canvas-loseContext-poisons-strictmode-remount]].
- The parent container needs to be `relative` + `overflow-hidden`, and the component should be `absolute inset-0`; the pixel afterglow is clearest on a dark background.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
