---
slug: splash-cursor
name: SplashCursor
category: decoration
group: overlay-fx
tags: [animated]
exports: [SplashCursor]
status: enriched
---

# SplashCursor

> Fluid splash cursor · Pointer fluid splash cursor special effects · Moving splash color + click explosion spot + trailing dispersion · Rainbow hue wheel/fixed chart token dual mode (canvas2d zero dependency·reduced-motion·client component) · decoration/overlay-fx · #animated

## When to Use

Use it to add color splashes on pointer movement and burst spots on click in a hero, playful landing page, or full-page layer. This dependency-free Canvas 2D effect uses `pointer-events-none`, so it does not block interaction. For continuous trails, use [Ribbons](../ribbons/ribbons.md); for pixel afterglow, use [PixelTrail](../pixel-trail/pixel-trail.md).

## Import
```ts
import { SplashCursor } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| rainbow | `boolean` | `true` | Cycles each splash through the HSV hue wheel; when false, uses `color` |
| color | `string` | `var(--color-chart-1)` | Fixed sputtering color in non-rainbow mode, token must be prefixed with `--color-`; ignored for rainbow |
| splatRadius | `number` | `56` | Sputtering radius reference (px), the larger the color spot, the fuller it will be |
| splatForce | `number` | `1` | Sputtering intensity: the displacement and trailing length of the splash with the pointer speed, recommended 0.5-2 |
| dissipation | `number` | `0.92` | Spot retention rate (attenuation per second, 0-1), the closer to 1 the more durable it is |
| opacity | `number` | `1` | Overall opacity (0-1), can be dimmed when stacking content below |
| className | `string` | - | Additional class name for the root container, which fills a relative parent |
| style | `CSSProperties` | - | Inline styles forwarded to the root container |

## Examples
```tsx
//Default rainbow splash (parent needs relative + overflow-hidden)
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <SplashCursor />
</div>
```
```tsx
// Fixed theme color · Violent tailing
<SplashCursor rainbow={false} splatForce={1.8} dissipation={0.97} splatRadius={72} />
```

## Usage Guidelines

- Note that `dissipation` has "retention rate" semantics (the opposite of the original DENSITY_DISSIPATION): bigger is more durable, not bigger is faster to dissipate.
- Non-rainbow mode `color` uses a variable prefixed with `--color-` for token; this value is ignored when rainbow is enabled. See [[hulian-token-color-var-needs-color-prefix]].
- canvas2d with zero dependencies, and it ships `pointer-events-none` so it never blocks the
  interaction underneath; the parent must be `relative` for `absolute inset-0` to fill it. Under
  reduced-motion it degrades and stops splashing.
- Client component (`"use client"`): the canvas and the pointer listeners all live inside effects,
  so SSR touches no DOM and never errors out. A browser runtime is required for actual splashes.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
