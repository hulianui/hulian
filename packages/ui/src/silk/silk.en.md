---
slug: silk
name: Silk
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Silk, silkShowcase]
status: enriched
---

# Silk

> Silk flowing background · WebGL/ogl lazy loading shader (reproduced by react-bits) + chart token main color + reduced-motion gradient cover · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a high-quality flowing silk glossy background, which has a higher visual quality than a pure CSS background. Based on WebGL/ogl (lazy loading), there is GPU overhead, but it comes with reduced-motion / gradient fallback without WebGL; if you do not want to introduce WebGL, the next best option is to use pure CSS [Aurora](../aurora/aurora.md); if you want an iridescence spectrum texture, use [Iridescence](../iridescence/iridescence.md), if you want a silk grid, use [Threads](../threads/threads.md).

## Import
```ts
import { Silk, silkShowcase } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| speed | number | 5 | Animation-speed factor mapped to GLSL `uSpeed`; higher values move faster |
| scale | number | 1 | Noise scale; higher values create denser detail, while lower values create broader forms |
| color | string | `--color-chart-1` | Silk main color, CSS color string (hex/oklch/rgb/var). Default theme token |
| noiseIntensity | number | 1.5 | Particle noise intensity, 0 = no particles (pure color band) |
| rotation | number | 0 | Texture rotation angle (radians), such as `Math.PI/4`=45° |
| className | string | - | Additional class name for the canvas or fallback div |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | ReactNode | reduced-motion / static alternative content rendered without WebGL (default chart token gradient div) |

## Examples
```tsx
//Default dark background chart-1 token, comes with absolute inset-0 z-0, requires relative parent container
<div className="relative h-64 overflow-hidden rounded-xl">
  <Silk />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">Silk</p>
  </div>
</div>
```
```tsx
// Custom warm golden color + slow and delicate
<Silk color="oklch(0.78 0.18 55)" speed={2} scale={1.5} />
```

## Usage Guidelines

- WebGL components must be rendered on the client side; `color` supports `var(--…)`/oklch, and the component is responsible for parsing and feeding to the shader.
- Comes with `absolute inset-0 z-0`, overlay content must use `relative z-10`, parent container must use `relative` + `overflow-hidden`.
- The ogl shader is easy to step into the context reuse poison pit when double mounting in StrictMode or cleanup - if you change the source code, do not reuse the same canvas after calling `loseContext` in cleanup (see [[webgl-canvas-loseContext-poisons-strictmode-remount]]); headless screenshots may fallback due to the unavailability of WebGL, use a real browser to verify the vision.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
