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

> Ghost cursor trail · FBM smoke follows the pointer through a ring-buffered position history and fades after movement stops · OGL/WebGL implementation without Three.js and with a reduced-motion fallback · decoration/overlay-fx · #animated

## When to Use

Use it as a full-area smoke trail behind a hero, card, or landing-page section. Choose [ImageTrail](../image-trail/image-trail.md) when pointer movement should emit specific images; GhostCursor is an abstract atmospheric light effect. The component is an `absolute inset-0` overlay and reads best inside a relatively positioned dark container.

## Import
```ts
import { GhostCursor } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| trailLength | `number` | `32` | Number of historical pointer positions retained; higher values create a longer trail and increase fragment cost linearly, with 16-64 recommended |
| inertia | `number` | `0.5` | Inertia from 0 to 1; values near 1 drift farther, while values near 0 track the pointer closely |
| grainIntensity | `number` | `0.05` | Film-grain intensity from 0 to 0.3; 0 disables grain |
| brightness | `number` | `1.2` | Overall brightness multiplier; 0.8-2.0 is recommended |
| color | `string` | `var(--color-chart-1)` | Main smoke color; accepts any CSS color and defaults to a theme-aware token |
| scale | `number` | `1` | Positive noise-radius factor; higher values spread the smoke and lower values concentrate it |
| mixBlendMode | `CSSProperties["mixBlendMode"]` | `"screen"` | Canvas blend mode; `screen` creates light on dark backgrounds, while `multiply` or `normal` may suit light surfaces |
| className | `string` | - | Additional class name for the `absolute inset-0` root |
| style | `CSSProperties` | - | Inline styles forwarded to the root, such as `zIndex` |

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
