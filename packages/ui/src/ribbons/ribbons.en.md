---
slug: ribbons
name: Ribbons
category: decoration
group: overlay-fx
tags: [animated]
exports: [Ribbons]
status: enriched
---

# Ribbons

> Pointer-following ribbons · Spring-driven ogl polylines with elastic trails + optional length fade and sine-wave distortion (tokens · reduced-motion fallback) · decoration/overlay-fx · #animated

## When to Use

Use it for continuous elastic ribbons that follow the pointer in a hero, login page, or brand animation. For dispersed fluid particles, use [SplashCursor](../splash-cursor/splash-cursor.md); for a lit pixel grid, use [PixelTrail](../pixel-trail/pixel-trail.md).

## Import
```ts
import { Ribbons } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | `string[]` | `--color-chart-1/2/3` | One ribbon per color; when omitted, the component resolves chart tokens 1–3 from the container |
| baseSpring | `number` | `0.03` | Spring stiffness benchmark, the larger it is, the tighter the following (each superimposed random amount creates staggered) |
| baseFriction | `number` | `0.9` | Damping friction reference (0–1), the larger the value, the more viscous and less overshoot |
| baseThickness | `number` | `30` | Streamer base thickness (px) |
| offsetFactor | `number` | `0.05` | The horizontal offset factors of multiple streamers, the larger they are, the wider they spread out |
| maxAge | `number` | `500` | Tail attenuation life (ms), the larger the value, the longer the tail; 0 or Infinity returns to fixed 0.9 lerp |
| pointCount | `number` | `50` | The number of sampling points for each streamer (determines the smoothness of the polyline) |
| speedMultiplier | `number` | `0.6` | Trailing pursuit speed multiplier, combined with maxAge to control tail softness and hardness |
| enableFade | `boolean` | `false` | Fade out along the length of the streamer (the tail is transparent) |
| enableShaderEffect | `boolean` | `false` | shader fluctuation effect (sinusoidal jitter along the normal) |
| effectAmplitude | `number` | `2` | shader fluctuation amplitude, only effective when enableShaderEffect=true |
| className | `string` | — | Passthrough to container (or reduced-motion fallback div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static replacement without WebGL (default chart token gradient div) |

## Examples
```tsx
// Default three-color ribbons; the container must be relative and clip overflow.
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 285)" }}>
  <Ribbons />
</div>
```
```tsx
// Tail fade + wave effect
<Ribbons enableFade enableShaderEffect effectAmplitude={2} />
```

## Usage Guidelines

- The token in `colors` must be prefixed with `--color-`, and the bare `var(--primary)` shader will not parse it. See [[hulian-token-color-var-needs-color-prefix]].
- WebGL/ogl component, client-side rendering only; StrictMode double-mounted canvas context reuse risk, see [[webgl-canvas-loseContext-poisons-strictmode-remount]].
- The streamer follows the mouse in the entire container, and the parent needs to be `relative` + `overflow-hidden`; this component does not intercept lower-level interactions.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
