---
slug: crosshair
name: Crosshair
category: decoration
group: overlay-fx
tags: [animated]
exports: [Crosshair]
status: enriched
---

# Crosshair

> Crosshair · Crosshair in the container that the pointer follows · lerp smooth trailing + entering jitter pulse + token color matching (zero dependency·reduced-motion) · decoration/overlay-fx · #animated

## When to Use

Use it when you need to display a crosshair that follows the pointer in a certain area (aiming/framing/technical style interactive area). It's a crosshair; if you want the cursor to jelly trail, use [BlobCursor](../blob-cursor/blob-cursor.md), to make clicks sparkle, use [ClickSpark](../click-spark/click-spark.md), to fill the screen with particles to absorb the background, use [Antigravity](../antigravity/antigravity.md).

## Import
```ts
import { Crosshair } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| color | `string` | `var(--color-primary)` | Crosshair color (automatic light and dark theme), it is recommended to use token |
| smoothing | `number` | `0.15` | Follow the smoothing coefficient (0–1), the smaller it is, the sticky and trailing it will be, the larger it will be, the more trailing it will be |
| thickness | `number` | `1` | Crosshair thickness (px) |
| pulseOnEnter | `boolean` | `true` | Trigger a jitter pulse (CSS scale) when entering the container; invalid under reduced-motion, the following is still retained |
| className | `string` | — | Forwarded to the root container (must be positioning context, absolute inset-0 inside the component is filled with the parent) |
| style | `CSSProperties` | — | Forward inline styles to the root container |

## Examples
```tsx
// Default: primary crosshair
<div className="relative h-56 overflow-hidden rounded-xl">
  <Crosshair />
</div>

// High viscosity trailing + token color
<Crosshair smoothing={0.06} color="var(--color-chart-3)" />
```

## Usage Guidelines

- The parent container must be a positioning context and have a clear height: the inside of the component is filled with `absolute inset-0`. If there is no positioning/no height, the crosshair will not be visible.
- It is recommended to use the token `color` with the `--color-` prefix (`var(--color-primary)`) to ensure parsing. See [[hulian-token-color-var-needs-color-prefix]].
- Enter pulse is disabled in reduced-motion, but pointer following is still retained.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
