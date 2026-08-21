---
slug: meta-balls
name: MetaBalls
category: decoration
group: overlay-fx
tags: [animated]
exports: [MetaBalls]
status: enriched
---

# MetaBalls

> Merging metaballs · Orbiting blobs combine through an inverse-square field into an organic fusion-and-splitting background · Pointer-following cursor ball + automatic motion (ogl · token colors · reduced-motion gradient fallback) · decoration/overlay-fx · #animated

## When to Use

Use MetaBalls for an organic liquid-light background whose blobs merge, split, and follow the pointer, such as a hero, card surface, or loading screen. For edge refraction, use [ShapeBlur](../shape-blur/shape-blur.md) or Lens; for icons on a regular orbit, use [OrbitingCircles](../orbiting-circles/orbiting-circles.md). MetaBalls reads best on a dark background.

## Import
```ts
import { MetaBalls } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| color | `string` | `"var(--color-chart-1)"` | The filling color when the main ball is aggregated. Feed token must be prefixed with `--color-` |
| cursorBallColor | `string` | `"var(--color-chart-4)"` | Cursor ball color, mixed with color at the junction |
| speed | `number` | `0.3` | Revolution speed multiplier, the larger it is, the faster it will travel |
| enableMouseInteraction | `boolean` | `true` | Enable mouse interaction; when turned off, the cursor ball will automatically travel around the ellipse |
| hoverSmoothness | `number` | `0.05` | Cursor-ball interpolation coefficient (0-1); lower values produce more lag, while higher values follow more closely |
| animationSize | `number` | `30` | Observation scale, the larger the field of view, the smaller the balls and the more scattered they are |
| ballCount | `number` | `15` | Number of main balls (1-50, beyond clamping to 50) |
| clumpFactor | `number` | `1` | Clumping factor; higher values spread the orbit, while lower values keep the balls tighter |
| cursorBallSize | `number` | `3` | Cursor ball radius (shader units) |
| enableTransparency | `boolean` | `true` | Transparent background; fill in black background when false |
| className | `string` | - | Passthrough to canvas / fallback container |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / custom static fallback content without WebGL |

## Examples
```tsx
// Dark background + default parameters (container needs to be relative + overflow-hidden)
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <MetaBalls className="absolute inset-0" />
</div>
```
```tsx
// Warm color mixing + automatic tour (turn off mouse interaction, suitable for pure background)
<MetaBalls
  className="absolute inset-0"
  color="var(--color-chart-3)"
  cursorBallColor="var(--color-chart-5)"
  enableMouseInteraction={false}
  speed={0.25}
/>
```

## Usage Guidelines

- The token color given to `color` / `cursorBallColor` must be prefixed with `--color-` (`var(--color-chart-1)`). In this Tailwind v4 system, the bare `var(--primary)` cannot be parsed by the shader and will turn black. See [[hulian-token-color-var-needs-color-prefix]].
- WebGL/ogl component, client-side rendering only; when placed in the RSC page, note that it is `"use client"`. Canvas context reuse under StrictMode dual mounting may be poisoned, refer to [[webgl-canvas-loseContext-poisons-strictmode-remount]].
- The parent container needs `relative` + `overflow-hidden`, and the component should be filled with `absolute inset-0`; it is recommended that the background color be dark to see the glowing sticky ball clearly.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
