---
slug: ghost-cursor
name: GhostCursor
category: decoration
group: overlay-fx
tags: [animated]
exports: [GhostCursor]
status: enriched
---

# GhostCursor

> Ghost trailing cursor · Ghost smoke trail following pointer · fbm noise smoke + ring framebuffer history trail + coast fade (ogl WebGL · de three.js · reduced-motion downgrade) · decoration/overlay-fx · #animated

## When to Use

As a WebGL smoke trailing layer covering the entire area, let the pointer drag out glowing smoke on the hero/card/landing page. To throw out a specific image for trailing use [ImageTrail](../image-trail/image-trail.md); this component is an abstract smoke light effect, more suitable for pure atmosphere decoration. It is `absolute inset-0` overlay, and the parent container must be `relative` + dark background to achieve the effect.

## Import
```ts
import { GhostCursor } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| trailLength | `number` | `32` | The number of historical frames retained in the tail. The larger the number, the longer the tail. The fragment overhead increases linearly. It is recommended to 16–64 |
| inertia | `number` | `0.5` | Inertia from 0 to 1; values near 1 drift farther, while values near 0 track the pointer closely |
| grainIntensity | `number` | `0.05` | Film grain intensity 0–0.3, superimposed noise; 0 = off |
| brightness | `number` | `1.2` | Overall brightness gain, to compensate for the brightness loss after removing Bloom, recommended 0.8–2.0 |
| color | `string` | `var(--color-chart-1)` | Main color of smoke, light and dark theme; any CSS color string can be used |
| scale | `number` | `1` | Positive noise-radius factor; higher values spread the smoke and lower values concentrate it |
| mixBlendMode | `CSSProperties["mixBlendMode"]` | `"screen"` | Canvas blending mode, use screen for dark background to overlay and emit light; light color background can be changed to multiply/normal |
| className | `string` | — | Root container (absolute inset-0) additional className |
| style | `CSSProperties` | — | Forward the root container inline style (such as zIndex) |

## Examples
```tsx
<div
  className="relative h-64 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.14 0.02 285)" }}
>
  <GhostCursor />
</div>
```

Warm orange long tail (high inertia):
```tsx
<GhostCursor color="oklch(0.72 0.2 50)" trailLength={48} inertia={0.78} />
```

## Usage Guidelines

- If cleanup calls `loseContext` during React StrictMode remounting, reusing the canvas can leave it blank. Mount a fresh canvas each time; see [[webgl-canvas-loseContext-poisons-strictmode-remount]].
- The parent container must be `relative` + `overflow-hidden` + dark background (default screen blending mode is almost invisible on light background).
- WebGL renders only on the client; under reduced motion, the component uses its static fallback.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
