---
slug: liquid-ether
name: LiquidEther
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [LiquidEther]
status: enriched
---

# LiquidEther

> Liquid color field · Pointer-driven WebGL background · Color distortion + metaball flow + pointer stirring/automatic demo (ogl · tokens · reduced-motion fallback) · decoration/backdrop · #animated #webgl

## When to Use

Use it for a vivid liquid-color background that responds strongly to pointer movement, such as a creative site, product hero, or login page. For a regular dot or grid pattern, use [DotPattern](../dot-pattern/dot-pattern.md) or [GridPattern](../grid-pattern/grid-pattern.md); for a focused pointer light, use [Spotlight](../spotlight/spotlight.md). Lower `opacity` when using LiquidEther beneath foreground content.

## Import
```ts
import { LiquidEther } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | `string[]` | `["var(--color-chart-1)","var(--color-chart-2)","var(--color-chart-4)"]` | Palette, at least 1 color (less than 2 will automatically copy both ends); any CSS color string, switch with the light and dark theme |
| speed | `number` | `0.5` | Flow rate factor; recommended 0.2–1.5 |
| scale | `number` | `1` | Liquid-blob scale; lower values create smaller separated forms and higher values merge them, with 0.6–2 recommended |
| mouseForce | `number` | `1` | Pointer disturbance intensity; 0 = ignore pointer pure drift. Suggestions 0–2 |
| autoDemo | `boolean` | `true` | The virtual cursor automatically cruises and stirs when there is no interaction; when it is turned off, it stays still and waits for the real pointer |
| opacity | `number` | `1` | Overall opacity 0–1; commonly used on stacked content 0.6–0.85 to reduce visual weight |
| className | `string` | — | Additional class name for the root container or reduced-motion fallback |
| style | `CSSProperties` | — | Inline styles passed through to the root container |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL; default multi-point chart token radial-gradient static liquid level |

## Examples

```tsx
// Automatic demo motion inside a positioned, clipped parent
<div className="relative h-64 overflow-hidden rounded-xl">
  <LiquidEther />
</div>
```

```tsx
// Slow translucent backdrop with foreground content above it
<div className="relative h-64 overflow-hidden rounded-xl">
  <LiquidEther speed={0.3} scale={1.2} opacity={0.7} />
  <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-white">
    Hulian component library
  </div>
</div>
```

## Usage Guidelines

- The parent container must be `relative` + `overflow-hidden`, and the content should be stacked on top with `relative z-10`; the canvas will be full, so it is recommended to add `pointer-events-none` to the superimposed text to avoid eating the pointer and stirring [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].
- WebGL client component (`"use client"`); the SSR stage only renders fallback, and there will be no canvas.
- When `colors` is passed to `var(--color-…)`, it is parsed by the off-screen canvas at runtime. It must be prefixed with `--color-`. [[oklch-css-var-color-must-parse-via-offscreen-canvas]] cannot be parsed by bare `var(--primary)`.
- Headless screenshots can capture a still or blank frame when rAF is throttled. Verify the flow on a real device or with Playwright measurements; see [[recharts-headless-screenshot-blank-clippath-animation-starved]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
