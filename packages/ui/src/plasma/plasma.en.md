---
slug: plasma
name: Plasma
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Plasma]
status: enriched
---

# Plasma

> Plasma flow · WebGL background · 60-step ray marching + pointer distortion + forward, reverse, and ping-pong motion (ogl · token tint · reduced-motion fallback) · decoration/backdrop · #animated #webgl

## When to Use

Use it for a restrained, single-color plasma flow with a central glow and controllable direction. For intertwined two-color bands, use [PlasmaWave](../plasma-wave/plasma-wave.md); for pointer-stirred liquid color, use [LiquidEther](../liquid-ether/liquid-ether.md); for regular geometry, use [DotPattern](../dot-pattern/dot-pattern.md).

## Import
```ts
import { Plasma } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| color | `string` | `--color-chart-1` | Plasma main color, CSS color string; chart token is taken by default; pass `null`/parse failure and return to shader native color (not dyed) |
| speed | `number` | `1` | Flow speed factor (internally multiplied by 0.4 to feed the shader to align with the original); the larger, the faster |
| direction | `"forward" \| "reverse" \| "pingpong"` | `"forward"` | Flow direction: upward surge / reverse sinking / forward and reverse smooth reciprocation (smoothstep) |
| scale | `number` | `1` | Field of view zoom; the larger the screen, the closer the texture is, and the smaller the texture is, the denser it is |
| opacity | `number` | `1` | Overall opacity 0-1 (overlayed on shader alpha); used to darken soft backgrounds |
| mouseInteractive | `boolean` | `true` | Lets the pointer distort the flow; when false, motion is automatic and no pointer listener is attached |
| className | `string` | - | Passthrough to root (canvas container or fallback div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL; default chart token radial gradient (retains center glow look and feel) |

## Examples

```tsx
//Default: theme color plasma flow (parent container must be relative + overflow-hidden)
<div className="relative h-56 overflow-hidden rounded-xl">
  <Plasma />
</div>
```

```tsx
//Dark background + turn off interaction, content stack is higher z
<div className="relative h-56 overflow-hidden rounded-xl">
  <Plasma opacity={0.5} mouseInteractive={false} scale={1.3} />
  <div className="relative z-10 flex h-full items-center justify-center text-white">
    Hulian component library
  </div>
</div>
```

## Usage Guidelines

- The component covers the entire canvas, **the parent container must be `relative` + `overflow-hidden`, and the overlay content must be `relative z-10`**, otherwise the content [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]] will be covered.
- WebGL client component (`"use client"`); only fallback is rendered during the SSR phase.
- When `color` is passed to `var(--color-…)` and parsed by the off-screen canvas, it must be prefixed with `--color-`. If the parsing of bare `var(--primary)` fails, the original color will be returned instead of the theme color [[oklch-css-var-color-must-parse-via-offscreen-canvas]] you want.
- Headless screenshots can capture a still or blank frame when rAF is throttled. Verify motion on a real device or with Playwright measurements; see [[recharts-headless-screenshot-blank-clippath-animation-starved]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
