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

> Perspective scan grid · An infinite ray-cast grid supports solid, dashed, or dotted lines while a luminous band travels through scene depth · Optional pointer parallax, theme colors, and a static fallback · OGL/WebGL · decoration/backdrop · #animated #webgl

## When to Use

Use GridScan behind a technology hero or dashboard when the grid should recede in perspective and a scan band should move from far to near, near to far, or in both directions. Choose [GridPattern](../grid-pattern/grid-pattern.md) for a lightweight static grid, or [RetroGrid](../retro-grid/retro-grid.md) for a CSS perspective horizon with a retro aesthetic.

## Import
```ts
import { GridScan } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| linesColor | `string` | `var(--color-border)` | Grid-line color; accepts any CSS color and defaults to the theme-aware border token |
| scanColor | `string` | `var(--color-primary)` | Color of the luminous scan band; accepts any CSS color and defaults to the primary token |
| gridScale | `number` | `0.1` | Grid-cell scale; lower values create a denser grid, with 0.05–0.3 recommended |
| lineThickness | `number` | `1` | Grid-line thickness in screen pixels |
| lineStyle | `"solid" \| "dashed" \| "dotted"` | `"solid"` | Pattern applied to both grid axes |
| scanOpacity | `number` | `0.45` | Scan-band opacity from 0 to 1; 0 leaves only the grid |
| scanDirection | `"forward" \| "backward" \| "pingpong"` | `"pingpong"` | `forward` moves far to near, `backward` near to far, and `pingpong` alternates directions |
| scanDuration | `number` | `2` | Duration of one scan in seconds |
| scanDelay | `number` | `2` | Delay in seconds before each one-way scan; in `pingpong` mode it delays only the initial movement |
| scanSoftness | `number` | `2` | Scan-band softness; higher values make the band wider and softer |
| noiseIntensity | `number` | `0.01` | Fine screen-space grain; 0 produces a clean image |
| parallax | `boolean` | `true` | Tilt the camera slightly toward pointer movement that reaches the root; ignored by the reduced-motion fallback |
| className | `string` | — | Class name forwarded to the live or fallback root |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Foreground content wrapped by GridScan in a full-size `relative z-10` layer with pointer events restored |
| fallback | `ReactNode` | Content rendered inside the static token-colored grid when reduced motion is enabled |

## Examples
```tsx
// Pass foreground content as children; GridScan supplies its internal z-10 wrapper
<div className="relative h-64 overflow-hidden rounded-xl">
  <GridScan />
  <div className="relative z-10 flex h-full items-center justify-center">
    GridScan
  </div>
</div>
```
```tsx
// Dashed grid with a one-way far-to-near scan
<GridScan lineStyle="dashed" scanDirection="forward" scanOpacity={0.6} />
```

## Usage Guidelines

- GridScan is an `absolute inset-0 z-0` decorative layer. Put it in a `relative` container with an explicit height and `overflow-hidden`; pass content through `children` to use the component's built-in foreground wrapper.
- OGL/WebGL starts on the client. Reduced motion renders the static grid plus the same `children` and custom `fallback`; SSR and WebGL setup failure leave the canvas absent but retain `children`.
- The root defaults to `pointer-events-none`. Parallax responds when pointer events bubble from the built-in `children` layer; without a hit-testable child, the decorative root does not receive pointer movement. Because the root is also `aria-hidden`, keep essential accessible content outside GridScan.
- An opaque parent in a separate stacking context can cover a full-size background layer. If the canvas exists but is invisible, inspect stacking and background paint; see [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].
- CSS variables for `scanColor` and `linesColor` require full token names such as `var(--color-primary)`. Bare values such as `var(--primary)` do not resolve; see [[hulian-token-color-var-needs-color-prefix]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
