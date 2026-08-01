---
slug: soft-aurora
name: SoftAurora
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [SoftAurora]
status: enriched
---

# SoftAurora

> Soft aurora · Two layers of 3D Perlin noise and cosine gradients create flowing color bands with pointer parallax · OGL/WebGL, theme-token colors, and a reduced-motion fallback · decoration/backdrop · #animated #webgl

## When to Use

Use it for a soft flowing aurora in a dark hero or open marketing surface. For regular dots or lines, use [DotPattern](../dot-pattern/dot-pattern.md) or [GridPattern](../grid-pattern/grid-pattern.md); for volumetric corner beams, use [SideRays](../side-rays/side-rays.md). SoftAurora combines two Perlin-noise layers with a cosine color cycle.

## Import
```ts
import { SoftAurora } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| color1 | `string` | `var(--color-chart-1)` | Main Aurora ribbon color (layer 1), any CSS color string (off-screen canvas parsing) |
| color2 | `string` | `var(--color-chart-4)` | Auxiliary auroral ribbon color (layer 2), misalignment superposition produces mixed color interference |
| speed | `number` | `0.6` | Aurora flow speed magnification, recommended 0.2–2 |
| scale | `number` | `1.5` | Noise-sampling scale; higher values create finer texture, with 0.8–3 recommended |
| brightness | `number` | `1` | Overall brightness ratio |
| noiseFrequency | `number` | `2.5` | Noise fundamental frequency, affecting wrinkle density |
| noiseAmplitude | `number` | `1` | Noise base amplitude, affecting the fluctuation amplitude |
| bandHeight | `number` | `0.5` | The vertical position of the auroral belt (0–1), the smaller it is, the lower it is |
| bandSpread | `number` | `1` | Aurora band glow diffusion intensity |
| octaveDecay | `number` | `0.1` | Multi-octave noise attenuation coefficient, controlling the proportion of high-frequency details |
| layerOffset | `number` | `0` | Time phase shift of two layers of aurora, peak-staggered flow when non-zero |
| colorSpeed | `number` | `1` | Hue circulation flow speed (cosine gradient horizontal scrolling speed) |
| enableMouseInteraction | `boolean` | `true` | Mouse parallax (the aurora moves slightly with the pointer) |
| mouseInfluence | `number` | `0.25` | Mouse parallax intensity |
| className | `string` | — | Additional class name for the root container |
| style | `CSSProperties` | — | Inline styles passed through to the root container |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Content, such as a title, rendered over the static non-WebGL fallback |

## Examples
```tsx
//Default chart token double layer aurora
<div className="relative h-56 overflow-hidden rounded-xl">
  <SoftAurora className="absolute inset-0" />
</div>

// Slow, non-interactive backdrop with custom fallback content
<SoftAurora
  speed={0.3}
  bandHeight={0.35}
  enableMouseInteraction={false}
  className="absolute inset-0"
  fallback={<h1 className="...">Hulian component library</h1>}
/>
```

## Usage Guidelines

- WebGL requires client rendering; the component already declares `"use client"` and can be placed beneath a server-rendered page boundary.
- If it does not have `inset-0`, it must be positioned with className (`absolute inset-0` in the example); the parent container must have positioning + size + `overflow-hidden`.
- `color1` and `color2` are parsed through an off-screen canvas. Theme variables such as `var(--color-chart-1)` work; bare values such as `var(--primary)` do not. See [[hulian-token-color-var-needs-color-prefix]].
- Reduced-motion and non-WebGL environments use static gradients plus `fallback`; do not make motion essential to understanding the content.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
