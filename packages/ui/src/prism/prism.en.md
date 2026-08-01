---
slug: prism
name: Prism
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Prism]
status: enriched
---

# Prism

> Volumetric prism · An octahedral SDF raymarch produces refracted spectral bands with oscillating, three-axis, or pointer-following motion · Theme-derived hue, transparent rendering, and a static OGL/WebGL fallback · decoration/backdrop · #animated #webgl

## When to Use

Use Prism as a single sculptural focal point in a product hero or brand composition. Its `offset`, scale, and transparent canvas make room for adjacent copy without changing the surrounding layout. Choose [PrismaticBurst](../prismatic-burst/prismatic-burst.md) for light radiating across the full frame, or [Plasma](../plasma/plasma.md) and [PlasmaWave](../plasma-wave/plasma-wave.md) for continuous surface texture.

## Import
```ts
import { Prism } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| height | `number` | `3.5` | Prism height along the Y axis; increasing it produces a taller, narrower silhouette |
| baseWidth | `number` | `5.5` | Width of the prism base; use it with `height` to control the silhouette's proportions |
| animationType | `"rotate" \| "3drotate" \| "hover"` | `"rotate"` | `rotate` oscillates the base in the XZ plane, `3drotate` applies organic three-axis motion, and `hover` tilts toward the global pointer with inertia |
| glow | `number` | `1` | Volumetric-light strength; 0 leaves a dark outline |
| offset | `{ x?: number; y?: number }` | `{ x: 0, y: 0 }` | Translation from the viewport center in CSS pixels, useful for balancing the prism beside foreground content |
| noise | `number` | `0.5` | Film-grain strength; 0 renders a clean image |
| transparent | `boolean` | `true` | Preserve canvas alpha so the parent background shows through; this mode also raises saturation internally |
| scale | `number` | `3.6` | Overall prism scale; higher values occupy more of the viewport |
| hueShift | `number` | Derived from `--color-chart-1` | Hue rotation in radians; an explicit value replaces the theme-derived hue |
| colorFrequency | `number` | `1` | Spectral-band frequency; higher values create denser bands and lower positive values create wider bands. The current runtime normalizes 0 to 1. |
| hoverStrength | `number` | `2` | Maximum pointer-driven tilt in `hover` mode. The current runtime normalizes 0 to 1. |
| inertia | `number` | `0.05` | Pointer interpolation factor from 0 to 1; lower positive values ease for longer and higher values track more directly. The current runtime normalizes 0 to 0.12. |
| bloom | `number` | `1` | Brightness multiplier applied together with `glow`. The current runtime normalizes 0 to 1. |
| timeScale | `number` | `0.5` | Overall animation-speed multiplier. The current runtime normalizes 0 to 1 rather than freezing the frame. |
| className | `string` | — | Class name forwarded to the root container or reduced-motion fallback |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Content rendered inside the static chart-token radial glow when reduced motion is enabled |

## Examples

```tsx
// Theme-derived hue with the default oscillating motion
<div className="relative h-64 overflow-hidden rounded-xl">
  <Prism />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">Prism</p>
  </div>
</div>
```

```tsx
// Global-pointer tilt with a slightly more responsive interpolation
<Prism animationType="hover" hoverStrength={2.4} inertia={0.06} />
```

## Usage Guidelines

- Prism is an `absolute inset-0 z-0` decorative layer. Give its parent `position: relative`, explicit dimensions, and clipping as needed; place foreground content at `relative z-10` or above. See [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].
- `animationType="hover"` follows the **global pointer**, not just movement within the container. Only this mode installs pointer listeners; `rotate` and `3drotate` ignore pointer movement.
- WebGL starts on the client. Reduced motion renders the static radial glow plus custom `fallback`; SSR and WebGL setup failure leave the decorative root empty.
- When `hueShift` is omitted, the base hue is derived from `--color-chart-1` through an off-screen canvas. An explicit `hueShift` replaces that derived value. Theme variables must use the `--color-` prefix. See [[oklch-css-var-color-must-parse-via-offscreen-canvas]].
- Throttled animation frames can make headless screenshots appear static or empty. Verify rotation on a real device or with Playwright frame measurements; see [[recharts-headless-screenshot-blank-clippath-animation-starved]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
