---
slug: light-rays
name: LightRays
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [LightRays]
status: enriched
---

# LightRays

> Beam radiation · Volumetric beam radiation WebGL background · Eight-way origin + double-layer sinusoidal perturbation/diffusion attenuation/pulsation/noise/distortion + pointer direction following (ogl·token coloring·reduced-motion static gradient cover) · decoration/backdrop · #animated #webgl

## When to Use

Use it for a hero backdrop of volumetric rays emitted from one of eight origins and deflected by pointer movement. Use [LightPillar](../light-pillar/light-pillar.md) for one concentrated column, [Lightfall](../lightfall/lightfall.md) for descending illumination, or [Lightning](../lightning/lightning.md) for intermittent electric arcs.

## Import
```ts
import { LightRays } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| raysOrigin | `"top-center" \| "top-left" \| "top-right" \| "left" \| "right" \| "bottom-left" \| "bottom-center" \| "bottom-right"` | `"top-center"` | Beam emission origin, determines anchor point and propagation direction (four corners/four sides midpoint) |
| raysColor | `string` | `var(--color-chart-1)` | Beam color, any CSS color, off-screen canvas parsed to RGB |
| raysSpeed | `number` | `1` | Blink/rhythm speed multiplier, 0 is almost static (still renders one frame) |
| lightSpread | `number` | `1` | Beam diffusion angle, the larger it is, the more scattered it is, the smaller it is, the more it is gathered together, it is recommended to be 0.3-3 |
| rayLength | `number` | `2` | Beam length (multiple of relative viewport width) |
| pulsating | `boolean` | `false` | Overall brightness sinusoidal breathing over time |
| fadeDistance | `number` | `1` | The fade distance along the way (relative to the multiple of the viewport width), the smaller it is, the faster it fades out |
| saturation | `number` | `1` | Saturation, <1 to remove color and tend to gray, 0=pure gray scale |
| followMouse | `boolean` | `true` | Lets the beam direction follow the pointer; `mouseInfluence > 0` is required for visible deflection |
| mouseInfluence | `number` | `0.1` | Pointer influence on beam direction from 0-1; 0 disables deflection |
| noiseAmount | `number` | `0` | Particle noise intensity (0-1) |
| distortion | `number` | `0` | Angle distortion strength, making the beam sway rather than straight, recommended 0-1 |
| className | `string` | - | Root container (comes with pointer-events-none absolute inset-0 z-0) |
| style | `CSSProperties` | - | Forward the root container inline style |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Content overlaid on the beam layer, both WebGL and downgrade paths are rendered |
| fallback | `ReactNode` | reduced-motion / hidden content superimposed on static gradients without WebGL |

## Examples
```tsx
// Comes with absolute inset-0, container relative + fixed height + overflow-hidden
<div className="relative h-64 overflow-hidden rounded-xl">
  <LightRays raysOrigin="top-center" className="opacity-90" />
  <div className="relative z-10 flex h-full items-center justify-center">
    LightRays
  </div>
</div>
```
```tsx
// Left side shot · Warm color · Gather narrow beam
<LightRays raysOrigin="left" raysColor="oklch(0.78 0.16 70)" lightSpread={0.8} />
```

## Usage Guidelines

- The component comes with `pointer-events-none absolute inset-0 z-0`, and the overlay content must be `relative z-10` on top of it.
- `followMouse` defaults to true, but `mouseInfluence > 0` is required for visible deflection. Set `mouseInfluence={0}` for a stationary direction.
- ogl/WebGL client only; SSR/no WebGL outsources static gradients and downgrades reduced-motion. `children` Both paths are rendered to ensure DOM consistency.
- `raysColor` The `--color-` prefix token must be used to pass CSS variables, see [[hulian-token-color-var-needs-color-prefix]].
- Fullscreen background layers in a non-cascading context parent of an opaque background may be obscured by the parent background, see [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
