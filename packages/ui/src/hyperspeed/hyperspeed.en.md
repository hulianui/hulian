---
slug: hyperspeed
name: Hyperspeed
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Hyperspeed]
status: enriched
---

# Hyperspeed

> Jump tunnel · Hyperspace jump warp tunnel background · Two-color car light strip radiating from the vanishing point rushing towards the observer + turbulent distortion + procedural glow (ogl single shader·zero new dependency·token·reduced-motion static degradation) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a strong impact warp tunnel/jump speed hero background. For purely geometric perspective grids (no motion tunnels) use [RetroGrid](../retro-grid/retro-grid.md); for low-key grid shading use [GridPattern](../grid-pattern/grid-pattern.md).

## Import
```ts
import { Hyperspeed } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| speed | `number` | `1` | The overall propulsion speed multiplier, the larger it is, the faster it will rush. It is recommended to be 0.2–4 |
| density | `number` | `40` | The density of light strips on both sides of the road is larger and denser. It is recommended that 10–120 |
| distortion | `number` | `1` | Field of view distortion intensity (turbulence swing), 0=straight tunnel, recommended 0–2 |
| fade | `number` | `0.4` | Fog fade intensity, the greater the distance, the faster the distance will be engulfed by darkness, recommended 0–1 |
| leftColor | `string` | `var(--color-chart-4)` | Left (leaving) car light color, any CSS color |
| rightColor | `string` | `var(--color-chart-2)` | Right (approaching) car light color, any CSS color |
| className | `string` | — | Root container (itself block h-full w-full, the size is controlled by the container) |
| style | `CSSProperties` | — | Forward the root container inline style |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / content rendered in the static bottom layer without WebGL |

## Examples
```tsx
// The warp tunnel needs a dark background to show the glow, and the container height must be fixed + overflow-hidden
<div className="relative h-64 overflow-hidden rounded-xl bg-black">
  <Hyperspeed className="absolute inset-0" />
</div>
```
```tsx
// Full throttle: high speed and intensive
<Hyperspeed speed={3} density={90} className="absolute inset-0" />
```

## Usage Guidelines

- The glow is only visible on dark-colored containers, and is almost invisible on light-colored containers. It is recommended to use `bg-black` or dark-colored bases.
- The single-shader OGL effect renders only on the client. SSR, unavailable WebGL, and reduced motion use the static fallback.
- Fullscreen background layers in a non-cascading context parent of an opaque background may be obscured by the parent background, see [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].
- `leftColor`/`rightColor` must use the `--color-` prefix token when passing CSS variables, see [[hulian-token-color-var-needs-color-prefix]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
