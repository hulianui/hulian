---
slug: fluid-glass
name: FluidGlass
category: decoration
group: overlay-fx
tags: [animated]
exports: [FluidGlass]
status: enriched
---

# FluidGlass

> Fluid glass · Fluid glass refraction background that follows the pointer · Programmed flow gradient basemap + circular glass lens real-time refraction/magnification/edge dispersion/Fresnel highlight (ogl single shader · zero 3D dependency · reduced-motion) · decoration/overlay-fx · #animated

## When to Use

A whole "fluid glass" background is needed - a programmed flowing gradient base map + a circular glass lens that follows the pointer to refract and enlarge the base map in real time, suitable for hero/block backgrounds. To make a fixed-size glass panel (pill/card), use [GlassSurface](../glass-surface/glass-surface.md); to make a partial static magnifying glass, use [Lens](../lens/lens.md). FluidGlass is a "fluid full-screen glass background" that is rendered using the ogl WebGL shader.

## Import
```ts
import { FluidGlass } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| size | `number` | `0.26` | The ratio of the lens radius to the short side of the container is 0-1. The larger the refractive area, the wider the refractive area. It is recommended to be 0.15-0.4 |
| refraction | `number` | `0.5` | Refraction intensity (IOR mapping), the larger the center, the stronger the amplification/distortion, 0=almost transparent, recommended 0-1 |
| dispersion | `number` | `0.3` | Dispersion strength, simulates edge RGB dispersion edge, 0=off, recommended 0-1 |
| speed | `number` | `1` | Background flow speed magnification, 0 = background is stationary (the lens still follows the pointer) |
| colors | `string[]` | chart-1/2/4 | Background gradient color group, take the first 3, you can pass any CSS color |
| followPointer | `boolean` | `true` | The lens follows the pointer; stops at the center and drifts slowly when closed |
| className | `string` | - | Forward the root container className (the root is `relative overflow-hidden`, Canvas includes `absolute inset-0`) |
| style | `CSSProperties` | - | Forward the root container inline style |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Content overlaid on glass background (relative z-10 layered over Canvas) |

## Examples

```tsx
// Default: Move the pointer to see the lens follow
<div className="relative h-64 overflow-hidden rounded-xl">
  <FluidGlass className="absolute inset-0">
    <div className="flex h-full items-center justify-center text-lg font-semibold text-white">
      Fluid Glass
    </div>
  </FluidGlass>
</div>

// Strong refraction and strong dispersion thick glass
<FluidGlass size={0.32} refraction={0.85} dispersion={0.7} className="absolute inset-0" />
```

## Usage Guidelines

- WebGL components (ogl single shader) must be rendered on the client side, and SSR is empty; put into a fixed-height `relative overflow-hidden` container and give it `className="absolute inset-0"`.
- The `colors` feed token must be prefixed with `--color-`; the shader color selection is parsed by the component, and the bare `var(--primary)` is not parsed.
- Headless screenshots can be blank before the WebGL shader or context is ready. Verify in a real browser, and avoid reusing a canvas after cleanup calls `loseContext`; see [[webgl-canvas-loseContext-poisons-strictmode-remount]].
- Stop the background flow animation in reduced-motion (lens refraction is still there).

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
