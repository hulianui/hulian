---
slug: line-waves
name: LineWaves
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [LineWaves]
status: enriched
---

# LineWaves

> Flowing wave-line field · Dual sinusoidal displacement + noise ridges + three-channel color cycling + local pointer distortion (ogl · chart tokens · reduced-motion static fallback) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a layer of "flowing line texture" atmospheric background (Hero, login page, empty state background). For dot matrix/grid geometry, select [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md), for diagonal stripes, select [StripedPattern](../striped-pattern/striped-pattern.md), and for mouse focus, select [Spotlight](../spotlight/spotlight.md); this component is an organic undulating line field, with a stronger sense of movement and hue drift.

## Import
```ts
import { LineWaves } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| speed | `number` | `0.3` | Animation speed factor; the larger, the faster the flow, 0 = static texture |
| innerLineCount | `number` | `32` | Center area line density; determines density gradient together with outerLineCount |
| outerLineCount | `number` | `36` | Line density in the edge area; different from inner, there will be a density transition from the upper and lower edges to the center |
| warpIntensity | `number` | `1` | Ripple distortion strength; higher values produce rougher waves, while 0 produces straight parallel lines |
| rotation | `number` | `-45` | Overall texture rotation angle (degrees); -45° makes the ripples diagonal |
| edgeFadeWidth | `number` | `0` | The starting width of the upper and lower edge fades; increasing it will narrow the center line area |
| colorCycleSpeed | `number` | `1` | Color cycle speed; three-channel hue drifts over time, 0 = constant color |
| brightness | `number` | `0.2` | Overall brightness coefficient; because alpha=color length, it also affects transparency. Recommendation 0.1–0.6 |
| color1 | `string` | `--color-chart-1` | The first channel color, CSS color string; the default is chart token light and dark adaptive |
| color2 | `string` | `--color-chart-2` | Second channel color |
| color3 | `string` | `--color-chart-4` | The third channel color; all three colors pass the same value (such as #ffffff) to restore the original white line |
| enableMouseInteraction | `boolean` | `true` | Turn on the local distortion extrapolation of the pointer; turn it off for pure automatic flow |
| mouseInfluence | `number` | `2` | Pointer influence strength; only effective when enableMouseInteraction=true |
| className | `string` | — | Additional class name for the root container or reduced-motion fallback div |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL; default oblique chart token gradient lines |

## Examples

```tsx
// Default chart-token waves; the parent must be relative and content needs a higher z-index.
<div className="relative h-64 overflow-hidden rounded-xl">
  <LineWaves />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">LineWaves</p>
  </div>
</div>
```

```tsx
// Restore classic white lines by using the same color for all channels and disabling color cycling.
<LineWaves color1="#ffffff" color2="#ffffff" color3="#ffffff" brightness={0.25} colorCycleSpeed={0} />
```

## Usage Guidelines

- The component comes with `absolute inset-0 z-0`, **the parent container must be `relative` and the page content must be stacked with a higher z-index** (such as `relative z-10`), otherwise the lines will either be positioned incorrectly or cover the content [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].
- WebGL client component, before placing it into the RSC tree under Next App Router, note that it is `"use client"`; the canvas is not rendered in the SSR stage, only fallback is used.
- When passing `var(--color-…)` from `color1/2/3`, the color is parsed through the off-screen canvas at runtime. **Naked `var(--primary)` without the `--color-` prefix will fail to parse** (black/transparent) [[oklch-css-var-color-must-parse-via-offscreen-canvas]].
- Headless screenshots can capture blank or still frames when rAF animation is throttled. Verify the motion on a real device or with Playwright measurements; see [[recharts-headless-screenshot-blank-clippath-animation-starved]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
