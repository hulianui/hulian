---
slug: evil-eye
name: EvilEye
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [EvilEye]
status: enriched
---

# EvilEye

> Fiery eye · Layered procedural noise in polar coordinates creates a turbulent iris, inertial pointer tracking, and a diffuse outer glow · OGL/WebGL, theme-aware color, and a static reduced-motion fallback · decoration/backdrop · #animated #webgl

## When to Use

Use it as a dramatic focal backdrop for a hero, 404 page, or launch screen where an eye should react to the pointer. Use [DotPattern](../dot-pattern/dot-pattern.md) or [GridPattern](../grid-pattern/grid-pattern.md) for tiled geometry, [Spotlight](../spotlight/spotlight.md) for an abstract pointer focus, or [Ripple](../ripple/ripple.md) for expanding waves.

## Import
```ts
import { EvilEye } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| eyeColor | `string` | `--color-chart-3` | Main flame color; accepts any CSS color, including theme variables |
| backgroundColor | `string` | Transparent, resolving to black | Background color; usually inherited from the container |
| intensity | `number` | `1.5` | Overall light intensity; 0.8-2.5 is recommended |
| pupilSize | `number` | `0.6` | Pupil size; higher values look fuller and lower values narrower, with 0.2-1.0 recommended |
| irisWidth | `number` | `0.25` | Iris (inner ring flame) width, recommended 0.1-0.4 |
| glowIntensity | `number` | `0.35` | Outer-ring glow strength; 0.1-0.6 is recommended |
| scale | `number` | `0.8` | Eye scale; higher values occupy more of the viewport, with 0.5-1.2 recommended |
| noiseScale | `number` | `1.0` | Flame-noise scale; higher values create finer detail, with 0.5-2.0 recommended |
| pupilFollow | `number` | `1.0` | Pointer-follow amplitude; 0 disables movement, while inertial interpolation returns the pupil toward center after the pointer leaves |
| flameSpeed | `number` | `1.0` | Flame flow speed, recommended 0.3-2.0 |
| className | `string` | - | Forward the root container, the component defaults to `block h-full w-full`, and the size is determined by the container |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Content layered over the static fallback when reduced motion is preferred or WebGL is unavailable |

## Examples
```tsx
// Default: use theme chart-3 warm orange, pupils follow the cursor
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.01 60)" }}>
  <EvilEye className="absolute inset-0" />
</div>
```
```tsx
// Slow, non-interactive ambient backdrop
<EvilEye className="absolute inset-0" pupilFollow={0} flameSpeed={0.5} noiseScale={1.3} />
```

## Usage Guidelines

- OGL/WebGL renders on the client. SSR and unavailable WebGL show the static fallback, so design the initial frame around that state.
- Place the component in a `relative overflow-hidden` container with an explicit height such as `h-64`.
- The flame reads best against a dark surface. On light pages, pass a dark `backgroundColor` or add a dark container background.
- `pupilFollow` depends on pointer events and therefore has no visible effect on pointerless devices.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
