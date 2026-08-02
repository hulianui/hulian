---
slug: beams
name: Beams
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Beams]
status: enriched
---

# Beams

> Flowing light column · Flowing volume light column WebGL background · perlin noise disturbance fluctuation + directional light receiving gradient + tilted light curtain + film grain (ogl·token·static reduced-motion fallback) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a cool, deep oblique volumetric light background (technical product Hero, dark landing page). If you want regular dot matrix/grid shading, use [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md); if you want oil swirls, use [Balatro](../balatro/balatro.md); Beams is a strip-shaped flowing light curtain that emphasizes the sense of direction and film texture, and is suitable for the main visual background.

## Import
```ts
import { Beams } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| beamNumber | `number` | `12` | Number of vertical beam bands; 4–24 is recommended, since high values blur together on lower-end devices |
| beamWidth | `number` | `2` | Relative width of each beam; higher values leave narrower gaps |
| speed | `number` | `2` | The speed of the beam flowing along the axis; 0 = static (still retains the static texture) |
| lightColor | `string` | `--color-chart-1` | Beam color, CSS color string, default theme token light and dark adaptive |
| noiseIntensity | `number` | `1.75` | Grain noise intensity, simulated film texture; 0 = pure and grain-free |
| scale | `number` | `0.2` | Noise scale; lower values stretch the waves, while higher values create finer detail |
| rotation | `number` | `30` | Rotation angle of the entire set of beams (degrees); 0 = vertical, positive value clockwise oblique |
| className | `string` | — | Class name forwarded to the root container, which includes `absolute inset-0 z-0` |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static content rendered without WebGL (overlaid on top of the gradient) |

## Examples
```tsx
//Default beam background
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <Beams />
</div>
```
```tsx
// Warm orange wide beam oblique light curtain
<Beams
  lightColor="oklch(0.78 0.18 55)"
  beamNumber={8}
  beamWidth={3}
  rotation={20}
  scale={0.3}
/>
```

## Usage Guidelines

- **WebGL client rendering**: the effect depends on OGL and WebGL. SSR renders the static-gradient `fallback`; do not mount realtime logic directly in a server component.
- **The token color must be prefixed with `--color-`**: `lightColor` The CSS variable must be passed with the full name of `var(--color-chart-1)`, and the bare `var(--chart-1)` does not resolve. See [[hulian-token-color-var-needs-color-prefix]].
- Values of `beamNumber` above 24 blur together and increase GPU cost on lower-end devices.
- The parent container must be `relative` + `overflow-hidden`.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
