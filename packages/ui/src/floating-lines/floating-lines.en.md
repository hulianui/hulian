---
slug: floating-lines
name: FloatingLines
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [FloatingLines]
status: enriched
---

# FloatingLines

> Floating harnesses · WebGL background · Three sets of sine wave harnesses floating over time + log radius twist rotation + gradient ribbon interpolation + optional pointer radial bending (ogl zero new dependency · theme-token chart · static reduced-motion fallback) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a light, low-obtrusion, flowing background with text on top (hero, landing page, marketing block). For dot matrix/grid geometric shading, use [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md); for liquid metal ridges, use [Ferrofluid](../ferrofluid/ferrofluid.md); for pointer focus, use [Spotlight](../spotlight/spotlight.md). The wiring harness of this component is thin and friendly to the readability of foreground text.

## Import
```ts
import { FloatingLines } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | `string[]` | `--color-chart-1/2/4` | Line gradient color band, interpolation from beginning to end along the line, up to the first 5 segments; any CSS color |
| lineCount | `number` | `6` | The number of lines in each of the three groups of waves, the more, the denser and the greater the cost, it is recommended 3-12 |
| lineDistance | `number` | `5` | Transverse phase spacing of adjacent lines (sense of dense stacking) |
| animationSpeed | `number` | `1` | Animation speed magnification, 0=still |
| interactive | `boolean` | `true` | When the pointer approaches, the line bends and pulls radially; reduced-motion / no WebGL automatically fails |
| bendRadius | `number` | `5` | Pointer bending affects the radius coefficient, the larger the range, the smaller the focus |
| bendStrength | `number` | `-0.5` | Pointer bending strength (with sign, negative value reverse pull) |
| className | `string` | - | Forward the root container, the root includes `absolute inset-0 z-0` |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / no WebGL static pocket content (such as watermark copy) |

## Examples
```tsx
// Default: use theme chart token gradient harness
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <FloatingLines />
  <div className="relative z-10 flex h-full items-center justify-center text-white/80">
Hulian component library
  </div>
</div>
```
```tsx
//Dense slow wallpaper + off interaction
<FloatingLines lineCount={10} animationSpeed={0.6} lineDistance={4} interactive={false} />
```

## Usage Guidelines

- OGL/WebGL client-side rendering: placed within the `"use client"` boundary; SSR / no WebGL renders only the fallback.
- The root includes `absolute inset-0 z-0`, which needs to be put into the `relative` container; the foreground content needs `relative z-10` to be placed on the wire harness.
- `lineCount` is the number of each group (three groups in total), the actual number of lines is about 3 times, please pay attention to the performance when increasing.
- `bendStrength` The default negative value is intentional reverse traction, and the correction value direction will be reversed.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
