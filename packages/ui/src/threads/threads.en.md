---
slug: threads
name: Threads
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Threads]
status: enriched
---

# Threads

> Flowing silk thread background · WebGL/ogl Perlin wave line swings with the mouse + transparent bottom overlay + chart token + static fallback · decoration/backdrop · #animated #webgl

## When to Use

Use it for sparse, pointer-responsive threads on a transparent surface, such as a minimal header, footer, or hero accent. [Silk](../silk/silk.md) creates a full fabric surface, while [Iridescence](../iridescence/iridescence.md) creates a spectral surface. For a CSS-only alternative, use [Aurora](../aurora/aurora.md).

## Import
```ts
import { Threads } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| color | `[number, number, number] \| string` | `--color-chart-1` | Thread color as a 0–1 RGB tuple or CSS color. When omitted, the component reads the chart token |
| amplitude | number | 1 | Wave amplitude; higher values produce stronger motion. Recommended range 0.3–3 |
| distance | number | 0 | The longitudinal spacing of each wire is scaled. Positive values expand and negative values compress. It is recommended to -1–2 |
| enableMouseInteraction | boolean | true | Mouse following: X affects time flow rate, Y affects amplitude, with 0.05 smooth interpolation |
| className | string | — | Additional class name for the canvas or fallback div |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | ReactNode | Reduced-motion or non-WebGL replacement (defaults to several CSS gradient lines). Pass `null` to hide it completely. |

## Examples
```tsx
//Default dark background color chart-1, requires relative + overflow-hidden parent container
<div className="relative h-56 overflow-hidden rounded-xl">
  <Threads />
</div>
```
```tsx
// blue tint (RGB array) + increase amplitude
<Threads color={[0.22, 0.53, 0.96]} amplitude={1.2} />
```

## Usage Guidelines

- WebGL component, which must be rendered by the client; `color` accepts both the `[r,g,b]` array of 0–1 and the CSS string (including `var(--color-chart-3)`/oklch/hex).
- When ogl/WebGL is dual-mounted in StrictMode or cleanup, it is easy to step on the context reuse poison pit - when changing the source code, do not cleanup and adjust `loseContext` and then reuse the same canvas (see [[webgl-canvas-loseContext-poisons-strictmode-remount]]); use fallback when there is no WebGL in headless, use a real browser for visual verification.
- Transparent bottom, you need to put it in a container with a background color to see clearly; the parent container must be `relative` + `overflow-hidden`.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
