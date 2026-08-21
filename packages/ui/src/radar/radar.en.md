---
slug: radar
name: Radar
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Radar]
status: enriched
---

# Radar

> Radar scan · WebGL background · Concentric ripples + radial spokes + rotating sweep + edge falloff + pointer parallax (ogl · chart-token color · reduced-motion static fallback) · decoration/backdrop · #animated #webgl

## When to Use

A dynamic background that requires the atmosphere of a technology/surveillance/command center, the rotation of the scanning arm is a metaphor for "real-time detection." Use [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md) for regular geometric lattices/line networks; use [Ripple](../ripple/ripple.md) for single-point concentric diffusion waves; Radar is the only "radar dish" in this family with rotating scanning arms + concentric rings + spokes.

## Import
```ts
import { Radar } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| speed | `number` | `1` | Overall animation speed factor (ring wave diffusion + scan arm shared base time), mapped GLSL uSpeed |
| scale | `number` | `0.5` | View scale: lower values enlarge and crop the disk; higher values shrink it and leave more margin |
| ringCount | `number` | `10` | The number of concentric rings, the larger, the denser |
| spokeCount | `number` | `10` | Number of spokes (radial dividers), 0 = no spokes |
| ringThickness | `number` | `0.05` | The thickness of the concentric ring lines, the larger, wider and softer |
| spokeThickness | `number` | `0.01` | Spoke line thickness |
| sweepSpeed | `number` | `1` | Scan arm rotation speed |
| sweepWidth | `number` | `2` | Scanning arm width (power sharpness), the larger, narrower and sharper |
| sweepLobes | `number` | `1` | Number of scanning arm flaps, 1 = single beam / 2 = symmetrical double beam |
| color | `string` | `var(--color-chart-1)` | Radar main color (ring/spoke/scan arm), any CSS color string |
| backgroundColor | `string` | - | Radar background color (resident base color), default transparent to reveal the host background |
| falloff | `number` | `2` | Edge-attenuation exponent; higher values keep the center focused and fade the edge faster |
| brightness | `number` | `1` | Overall brightness ratio |
| enableMouseInteraction | `boolean` | `true` | Whether to turn on mouse parallax (the disk moves smoothly with the pointer) |
| mouseInfluence | `number` | `0.1` | Mouse parallax influence coefficient |
| className | `string` | - | Passthrough to the root container (or fallback div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL (default radial gradient decoration div) |

## Examples
```tsx
//Default parameters, main color uses chart token, automatic light and dark adaptation
<div className="relative h-64 overflow-hidden rounded-xl">
  <Radar />
</div>

// Dense ring + double-flap quick scan
<Radar ringCount={16} spokeCount={16} sweepSpeed={1.8} sweepLobes={2} />
```

## Usage Guidelines

- Requires client-side rendering (WebGL/ogl), the component comes with `"use client"`; when placing it into the RSC page, make sure it is hung in the client subtree or dynamic import.
- The container needs to have its own positioning + `overflow-hidden`, and the component will cover the parent with `absolute inset-0`; the radar disk will not be visible when the parent has no size.
- Reduced-motion and non-WebGL environments render the static `fallback`; do not use the scanning arm to communicate essential information.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
