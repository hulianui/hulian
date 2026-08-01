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

> Scanning grid · Perspective WebGL grid with solid, dashed, or dotted lines, a luminous depth-traveling scan pulse, and pointer parallax · OGL, theme tokens, and a static reduced-motion fallback · decoration/backdrop · #animated #webgl

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
| gridScale | `number` | `0.1` | Grid scale; lower values create denser lines, with 0.05–0.3 recommended |
| lineThickness | `number` | `1` | Grid line thickness (screen pixels) |
| lineStyle | `"solid" \| "dashed" \| "dotted"` | `"solid"` | Line style: solid line / dashed line / dotted line |
| scanOpacity | `number` | `0.45` | Scan with luminous opacity (0–1), 0=pure mesh without pulses |
| scanDirection | `"forward" \| "backward" \| "pingpong"` | `"pingpong"` | Scanning direction: from far to near / from near to far / round trip cycle |
| scanDuration | `number` | `2` | Duration of one scan in seconds |
| scanDelay | `number` | `2` | Pause between two scans (seconds), only affects the start delay during pingpong |
| scanSoftness | `number` | `2` | Scan-band softness; higher values make the band wider and softer |
| noiseIntensity | `number` | `0.01` | Granular noise intensity, 0 = clean and no noise |
| parallax | `boolean` | `true` | Apply subtle pointer-driven perspective; inactive in reduced-motion and non-WebGL fallbacks |
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

- OGL/WebGL renders on the client. SSR, reduced-motion, and unavailable WebGL show the static-grid `fallback`.
- A full-screen background layer placed in a non-cascading context parent of an opaque background may be covered by the parent background and completely black, see [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].
- For `scanColor` and `linesColor`, pass CSS variables with the `--color-` prefix. Bare values such as `var(--primary)` do not resolve; see [[hulian-token-color-var-needs-color-prefix]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
