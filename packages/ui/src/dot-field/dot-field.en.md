---
slug: dot-field
name: DotField
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [DotField]
status: enriched
---

# DotField

> Interactive lattice background · The cursor pushes the lattice to bulge + moves with radial glow, optional wavy/star flashing (Canvas 2D zero dependency·token color matching·reduced-motion static degradation) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need an interactive dot matrix background that bulges and glows with the cursor (tech product Hero, console shading, empty state). If you want purely static CSS dot matrix shading, use [DotPattern](../dot-pattern/dot-pattern.md) (lightweight, does not consume the GPU); if you want light curtain/vortex, use [Beams](../beams/beams.md) / [Balatro](../balatro/balatro.md); DotField is a Canvas 2D real-time interactive field that emphasizes cursor ripples and bulges. It is heavier than DotPattern but has interactivity.

## Import
```ts
import { DotField } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| dotRadius | `number` | `1.5` | Drawing radius of a single point (px), recommended 1–3 |
| dotSpacing | `number` | `14` | Spacing between adjacent points (px), the larger the sparser, the recommended 8–24 |
| cursorRadius | `number` | `220` | Cursor influence radius (px), how many points around the pointer are pushed |
| bulgeStrength | `number` | `56` | Bulging strength (px), the maximum displacement of a point pushed away from its original position; 0 = only emits light with the cursor |
| color | `string` | `--color-chart-1` | Dot matrix base color, CSS color string; token must be prefixed with `--color-` |
| glowColor | `string` | `--color-primary` | Radial glow color at cursor |
| glowRadius | `number` | `160` | Glow radius (px); 0=turn off glow |
| waveAmplitude | `number` | `0` | Wave amplitude (px), the "breathing" feeling of global sinusoidal fluctuations; 0 = no wave |
| sparkle | `boolean` | `false` | Whether to turn on random flashing (a small number of dots occasionally enlarge into star dots) |
| className | `string` | — | Additional className passed through to the root container |
| style | `CSSProperties` | — | Inline styles passed through to the root container |

## Examples
```tsx
// Default matrix: move pointer to push + glow
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 280)" }}>
  <DotField />
</div>
```
```tsx
// undulating waves + twinkling stars + custom color matching
<DotField
  waveAmplitude={5}
  sparkle
  dotSpacing={16}
  color="oklch(0.75 0.2 50)"
  glowColor="oklch(0.7 0.18 200)"
/>
```

## Usage Guidelines

- **Token color must be prefixed with `--color-`**: The `color`/`glowColor` passed to the Canvas must write the full name (such as `var(--color-chart-1)`). The bare `var(--chart-1)` Canvas does not parse → the stipples turn black/the glow disappears. See [[hulian-token-color-var-needs-color-prefix]].
- **Client rendering**: relies on Canvas 2D + `requestAnimationFrame`, SSR/reduced-motion downgrades static lattice; do not directly mount real-time logic in the server component.
- The parent container must be `relative` + `overflow-hidden` (the component has its own absolute logic).

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
