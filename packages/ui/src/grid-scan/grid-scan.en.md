---
slug: grid-scan
name: GridScan
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [GridScan]
status: enriched
---

# GridScan

> Scanning grid · Perspective scanning grid WebGL background · Raycast infinite grid (solid/dashed/dotted line) + depth-advanced luminous scanning pulse + pointer parallax deflection (ogl·token·reduced-motion degraded static mesh) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a technological perspective grid + a luminous scanning pulse with depth advancement to make a hero/instrument panel background. Just use [GridPattern](../grid-pattern/grid-pattern.md) for static grid shading (no scanning, no WebGL); for a retro horizon perspective grid use [RetroGrid](../retro-grid/retro-grid.md).

## Import
```ts
import { GridScan } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| linesColor | `string` | `var(--color-border)` | Grid line color, CSS color string, default is token, light and shade adaptive |
| scanColor | `string` | `var(--color-primary)` | Scanning strip luminescence color, the default is the main color of the brand |
| gridScale | `number` | `0.1` | Grid density (grid scaling), the smaller, the denser, recommended 0.05–0.3 |
| lineThickness | `number` | `1` | Grid line thickness (screen pixels) |
| lineStyle | `"solid" \| "dashed" \| "dotted"` | `"solid"` | Line style: solid line / dashed line / dotted line |
| scanOpacity | `number` | `0.45` | Scan with luminous opacity (0–1), 0=pure mesh without pulses |
| scanDirection | `"forward" \| "backward" \| "pingpong"` | `"pingpong"` | Scanning direction: from far to near / from near to far / round trip cycle |
| scanDuration | `number` | `2` | Single scan duration (seconds), the larger the time, the slower |
| scanDelay | `number` | `2` | Pause between two scans (seconds), only affects the start delay during pingpong |
| scanSoftness | `number` | `2` | The degree of softness of the scanning band, the larger the light band, the wider and softer it is |
| noiseIntensity | `number` | `0.01` | Granular noise intensity, 0 = clean and no noise |
| parallax | `boolean` | `true` | Slight perspective deflection with the pointer; reduced-motion / no WebGL automatic failure |
| className | `string` | — | Root container (or fallback div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Content stacked above the grid, automatic relative z-10 cascading |
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL, default token static mesh |

## Examples
```tsx
// Container fixed height + overflow-hidden, children are automatically stacked on top of the grid
<div className="relative h-64 overflow-hidden rounded-xl">
  <GridScan />
  <div className="relative z-10 flex h-full items-center justify-center">
    GridScan
  </div>
</div>
```
```tsx
// Dotted grid · Scan forward
<GridScan lineStyle="dashed" scanDirection="forward" scanOpacity={0.6} />
```

## Usage Guidelines

- ogl/WebGL, client-side rendering only; SSR produces fallback static mesh, and it is normal for the real shader to be used after hydration. Stops at `fallback` under reduced-motion / no WebGL.
- A full-screen background layer placed in a non-cascading context parent of an opaque background may be covered by the parent background and completely black, see [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].
- Custom `scanColor`/`linesColor` must use the `--color-` prefix token when passing CSS variables. The bare `var(--primary)` will not be parsed, see [[hulian-token-color-var-needs-color-prefix]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
