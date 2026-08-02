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

> Interactive dot field · Pointer-driven displacement and radial glow with optional waves and sparkles · Dependency-free Canvas 2D, theme-aware colors, and a static reduced-motion fallback · decoration/backdrop · #animated #webgl

## When to Use

Use it for an interactive dot-matrix backdrop that displaces and glows around the pointer, such as a technology hero, console surface, or empty state. Use [DotPattern](../dot-pattern/dot-pattern.md) for a lighter static CSS pattern, [Beams](../beams/beams.md) for a light curtain, or [Balatro](../balatro/balatro.md) for a vortex. DotField trades some rendering cost for realtime pointer response.

## Import
```ts
import { DotField } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| dotRadius | `number` | `1.5` | Drawing radius of a single point (px), recommended 1–3 |
| dotSpacing | `number` | `14` | Distance between adjacent dots in pixels; higher values create a sparser field, with 8–24 recommended |
| cursorRadius | `number` | `220` | Cursor influence radius (px), how many points around the pointer are pushed |
| bulgeStrength | `number` | `56` | Maximum dot displacement in pixels; 0 keeps the glow but disables displacement |
| color | `string` | `--color-chart-1` | Dot matrix base color, CSS color string; token must be prefixed with `--color-` |
| glowColor | `string` | `--color-primary` | Radial glow color at cursor |
| glowRadius | `number` | `160` | Glow radius in pixels; 0 disables the glow |
| waveAmplitude | `number` | `0` | Global sinusoidal-wave amplitude in pixels; 0 disables the wave |
| sparkle | `boolean` | `false` | Occasionally enlarge a small number of dots to create a twinkling effect |
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
// Waves, sparkles, and custom colors
<DotField
  waveAmplitude={5}
  sparkle
  dotSpacing={16}
  color="oklch(0.75 0.2 50)"
  glowColor="oklch(0.7 0.18 200)"
/>
```

## Usage Guidelines

- **Token colors require the `--color-` prefix**: pass values such as `var(--color-chart-1)`. Canvas cannot resolve bare names such as `var(--chart-1)`, which can make dots black or remove the glow. See [[hulian-token-color-var-needs-color-prefix]].
- **Client rendering**: the live effect uses Canvas 2D and `requestAnimationFrame`. SSR and reduced-motion environments render the static lattice fallback.
- Give the parent `position: relative`, `overflow: hidden`, and an explicit height so the absolutely positioned canvas has stable bounds.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
