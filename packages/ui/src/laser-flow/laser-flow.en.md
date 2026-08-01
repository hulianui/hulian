---
slug: laser-flow
name: LaserFlow
category: decoration
group: overlay-fx
tags: [animated]
exports: [LaserFlow]
status: enriched
---

# LaserFlow

> Laser beam · Top-down volumetric WebGL light combining polar beam geometry, FBM fog, traveling wisps, and pointer-driven tilt · OGL implementation without Three.js, theme-aware color, and a reduced-motion fallback · decoration/overlay-fx · #animated

## When to Use

Use it as a full-screen or section-level volumetric backdrop where a laser, fog, and fine wisps descend from above. Use [BorderBeam](../border-beam/border-beam.md) to trace one element's border or [GhostCursor](../ghost-cursor/ghost-cursor.md) for pointer-driven smoke. LaserFlow is rendering-intensive; keep it behind content and layer foreground elements with `relative z-10`.

## Import
```ts
import { LaserFlow } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| color | `string` | `var(--color-chart-1)` | Laser main color, light and dark theme; any CSS color string can be used (→ uColor) |
| horizontalBeamOffset | `number` | `0.0` | Lateral beam offset (ratio of viewport width), plus right and minus left (→ uBeamXFrac) |
| verticalBeamOffset | `number` | `0.0` | Longitudinal beam offset (proportion of viewport height) (→ uBeamYFrac) |
| flowSpeed | `number` | `0.35` | Light-pulse speed multiplier (maps to `uFlowSpeed`) |
| verticalSizing | `number` | `2.0` | Vertical beam-length multiplier (maps to `uVLenFactor`) |
| horizontalSizing | `number` | `0.5` | Transverse flare length factor (→ uHLenFactor) |
| fogIntensity | `number` | `0.45` | Volume fog intensity, 0 = no fog (→ uFogIntensity) |
| fogScale | `number` | `0.3` | Fog-noise scale; higher values create finer structure (maps to `uFogScale`) |
| fogFallSpeed | `number` | `0.6` | Fog falling speed (→ uFogFallSpeed) |
| wispDensity | `number` | `1` | Microfluid optical density 0–2 (→ uWispDensity) |
| wispSpeed | `number` | `15` | Microstreaming speed (→ uWSpeed) |
| wispIntensity | `number` | `5` | Microfluid light intensity (→ uWIntensity) |
| flowStrength | `number` | `0.25` | Optical flow light and dark pulse intensity 0–1 (→ uFlowStrength) |
| decay | `number` | `1.1` | Beam attenuation phase width (→ uDecay) |
| falloffStart | `number` | `1.2` | Beam luminescence start attenuation (→ uFalloffStart) |
| mouseTiltStrength | `number` | `0.01` | Pointer-driven fog tilt intensity; set to 0 to disable interaction (→ `uTiltScale`) |
| className | `string` | — | Root container (or reduced-motion fallback div) additional className |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Static content for reduced motion or unavailable WebGL; defaults to a theme-token vertical beam gradient |

## Examples
```tsx
<div
  className="relative h-72 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.13 0.02 285)" }}
>
  <LaserFlow />
  <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/80">
    LaserFlow
  </div>
</div>
```

Warm orange laser + high fog:
```tsx
<LaserFlow color="oklch(0.72 0.2 35)" fogIntensity={0.6} fogScale={0.35} />
```

## Usage Guidelines

- WebGL (ogl) component, the cleanup call `loseContext` under double mounting of React StrictMode will poison the canvas reuse and cause a blank crash. Internally, a new canvas should be mounted each time, see [[webgl-canvas-loseContext-poisons-strictmode-remount]].
- Content must be layered on top of LaserFlow with `relative z-10` (or higher), otherwise it will be covered by the volumetric light.
- Reduced-motion and non-WebGL environments render the static gradient `fallback`; do not convey essential information through motion alone.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
