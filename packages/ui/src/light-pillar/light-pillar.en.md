---
slug: light-pillar
name: LightPillar
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [LightPillar]
status: enriched
---

# LightPillar

> Volumetric light pillar · A raymarch accumulates layered wave noise into one vertical beam, blending separate top and bottom theme colors · Adjustable width, tilt, grain, and glow with a static OGL/WebGL fallback · decoration/backdrop · #animated #webgl

## When to Use

Use LightPillar when a centered hero needs one continuous volumetric beam rather than a field of independent rays. Its narrow control range supports anything from a soft column to a laser-like line. Choose [Lightning](../lightning/lightning.md) for branching arcs, [LightRays](../light-rays/light-rays.md) for rays from an origin, or [Lightfall](../lightfall/lightfall.md) for multiple falling streaks.

## Import
```ts
import { LightPillar } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| topColor | `string` | `var(--color-chart-2)` | Beam color at the top; accepts any CSS color and defaults to a theme-aware chart token |
| bottomColor | `string` | `var(--color-chart-1)` | Beam color at the bottom, blended with `topColor` along the Y axis |
| intensity | `number` | `1` | Overall brightness multiplier |
| rotationSpeed | `number` | `0.3` | Rotation and internal-wave speed multiplier; 0 freezes both at their initial state |
| glowAmount | `number` | `0.005` | Gain applied to accumulated raymarch energy before compression; 0.001–0.02 is recommended |
| pillarWidth | `number` | `3` | Beam radius in world units; lower values create a thinner, laser-like column |
| pillarHeight | `number` | `0.4` | Vertical texture scale; higher values pack the internal bands more closely |
| noiseIntensity | `number` | `0.5` | Screen-space grain strength; 0 renders a clean beam |
| pillarRotation | `number` | `0` | Beam tilt in degrees, applied by rotating the sampling plane |
| className | `string` | — | Class name forwarded to the canvas container or fallback root |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Decorative content rendered inside the static two-color token gradient when reduced motion is enabled; the fallback root is `aria-hidden` |

## Examples
```tsx
// Default two-color beam inside a fixed-height clipped container
<div className="relative h-64 overflow-hidden rounded-xl">
  <LightPillar />
  <div className="relative z-10 flex h-full items-center justify-center">
    LightPillar
  </div>
</div>
```
```tsx
// Narrow, bright, grain-free beam
<LightPillar pillarWidth={1.4} glowAmount={0.009} noiseIntensity={0} intensity={1.2} />
```

## Usage Guidelines

- LightPillar is a full-size decorative layer. Use a `relative overflow-hidden` parent with an explicit height and place foreground content above it with `relative z-10`.
- During SSR, the live root has no canvas. After hydration, a canvas is appended before OGL import and scene setup; if either step fails, that uninitialized or blank canvas remains and LightPillar does not switch to the reduced-motion fallback. Reduced motion instead renders the static two-color beam plus decorative `fallback` content.
- `glowAmount` is intentionally small (`0.005` by default). Adjust it in small increments such as `0.009`; large increases quickly clip the beam to white.
- CSS variables for `topColor` and `bottomColor` require full token names such as `var(--color-chart-1)`. See [[hulian-token-color-var-needs-color-prefix]].
- If a full-size canvas is present but hidden, inspect parent backgrounds and stacking contexts; see [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
