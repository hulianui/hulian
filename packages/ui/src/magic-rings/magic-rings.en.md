---
slug: magic-rings
name: MagicRings
category: decoration
group: overlay-fx
tags: [animated]
exports: [MagicRings]
status: enriched
---

# MagicRings

> Concentric magic-ring background · Expanding and fading two-color ripples + grain + pointer parallax/hover zoom/click burst (ogl · token colors · reduced-motion static fallback) · decoration/overlay-fx · #animated

## When to Use

As a whole decorative background, it renders concentric halo ripples (two-color interpolation) that continuously expand and fade out, suitable for login page/hero/empty status shading. For a pouring volumetric laser, use [LaserFlow](../laser-flow/laser-flow.md), and for a border streamer surrounding a single element, use [BorderBeam](../border-beam/border-beam.md); this component is a "radial diffusion ripple" atmosphere layer. It is recommended that `className="absolute inset-0"` fill the parent container.

## Import
```ts
import { MagicRings } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| color | `string` | `var(--color-chart-1)` | Inner circle starting color, light and dark theme; any CSS color string can be used |
| colorTwo | `string` | `var(--color-chart-4)` | The outer ring termination color, the halo color is linearly interpolated according to the number of layers between color→colorTwo |
| speed | `number` | `1` | Animation-speed multiplier; higher values expand the rings faster |
| ringCount | `number` | `6` | Number of simultaneous rings, clamped to 1-10 |
| attenuation | `number` | `10` | Ring attenuation; higher values produce sharper, shorter-lived rings, while lower values are more diffuse |
| lineThickness | `number` | `2` | Loop thickness magnification |
| baseRadius | `number` | `0.35` | Innermost circle starting radius (normalized to approximately 0-1) |
| radiusStep | `number` | `0.1` | Increasing step size of the starting radius of two adjacent circles |
| scaleRate | `number` | `0.1` | The expansion range of the inner ring radius in a single life cycle |
| opacity | `number` | `1` | Overall opacity, overlaid on luminance-derived alpha |
| blur | `number` | `0` | CSS blur radius (px), >0 add filter:blur to the canvas |
| noiseAmount | `number` | `0.1` | Grain noise intensity, 0=clean |
| rotation | `number` | `0` | Overall rotation angle (degrees) |
| ringGap | `number` | `1.5` | Width of angular gaps in each ring; higher values create deeper, more petal-like cuts |
| fadeIn | `number` | `0.7` | Single loop fade-in ratio (early stage of life cycle) |
| fadeOut | `number` | `0.5` | Single loop fade-out starting point ratio (late period of life cycle) |
| followMouse | `boolean` | `false` | The halo follows the mouse displacement to generate parallax |
| mouseInfluence | `number` | `0.2` | The influence coefficient of the mouse on the overall displacement when followMouse |
| hoverScale | `number` | `1.2` | Overall zoom target value on hover |
| parallax | `number` | `0.05` | Parallax dislocation coefficient of each layer with mouse |
| clickBurst | `boolean` | `false` | Click burst (shortly enlarge + brighten when clicked) |
| className | `string` | - | Additional class name for the root container or fallback div |

## Examples
```tsx
<div
  className="relative h-64 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.14 0.02 280)" }}
>
  <MagicRings className="absolute inset-0" />
</div>
```

Interactive (mouse parallax + click burst):
```tsx
<MagicRings className="absolute inset-0" followMouse clickBurst hoverScale={1.25} />
```

## Usage Guidelines

- WebGL (ogl) component, cleanup and `loseContext` under React StrictMode dual mounting will poison the canvas reuse and cause it to go blank. A new canvas should be created internally every time it is mounted, see [[webgl-canvas-loseContext-poisons-strictmode-remount]].
- The parent container must be `relative` + dark background, and the halo should be filled with `absolute inset-0`.
- With reduced motion or without WebGL, the component falls back to static concentric rings; do not rely on the expansion animation.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
