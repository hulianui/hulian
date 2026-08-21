---
slug: faulty-terminal
name: FaultyTerminal
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [FaultyTerminal]
status: enriched
---

# FaultyTerminal

> Rain of failed terminals · Rain of characters from failed CRT terminals WebGL background · fbm noise lattice + lateral tearing/scanline/flicker/barrel distortion/dispersion + pointer ripple (ogl·token coloring·reduced-motion) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a highly dynamic background (hero, loading page, 404) in the style of cyberpunk/hacker terminal/retro CRT glitch. If you want a static and regular grid base, use [GridPattern](../grid-pattern/grid-pattern.md); if you want a retro perspective grid horizon, use [RetroGrid](../retro-grid/retro-grid.md); if you want pure stripes, use [StripedPattern](../striped-pattern/striped-pattern.md). This component has the most dynamic effects and the most "signal distortion" narrative.

## Import
```ts
import { FaultyTerminal } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| scale | `number` | `1.5` | Overall UV scaling, the larger the character, the denser the grid and the farther the field of view |
| gridMul | `[number, number]` | `[2, 1]` | Character grid row and column magnification [x, y], horizontally denser to imitate widescreen terminal |
| digitSize | `number` | `1.5` | The dot matrix size within a single character, the larger the size, the fatter each "number" block is |
| timeScale | `number` | `0.3` | Time flow rate factor, the larger the value, the faster the fault/flicker will be |
| pause | `boolean` | `false` | Freeze animation; forced freeze under reduced-motion, OR with this prop |
| scanlineIntensity | `number` | `0.3` | Scan line intensity, 0=none |
| glitchAmount | `number` | `1` | Lateral tear amount, >1 is more exaggerated, 1=original displacement |
| flickerAmount | `number` | `1` | The amount of flickering on and off the entire screen, 0=none |
| noiseAmp | `number` | `0` | Background organic noise amplitude, increasing superimposed flow fog noise |
| chromaticAberration | `number` | `0` | Dispersion (RGB separation) pixel amount, recommended 0-6 |
| dither | `number \| boolean` | `0` | Jitter particle intensity, boolean true=1/false=0 |
| curvature | `number` | `0.2` | Barrel distortion (CRT spherical curvature), 0=planar |
| tint | `string` | `--color-chart-2` | Character coloring, any CSS color, no theme token |
| mouseReact | `boolean` | `true` | Whether to respond to pointer movement with character highlights and ripples |
| mouseStrength | `number` | `0.2` | Pointer influence intensity, only effective when `mouseReact=true` |
| pageLoadAnimation | `boolean` | `true` | Fade in animation frame by frame when loading |
| brightness | `number` | `1` | Overall brightness ratio |
| className | `string` | - | Class name forwarded to the root container or fallback |
| style | `CSSProperties` | - | Forward the root container inline style |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative content without WebGL |

## Examples
```tsx
// Default: green character rain
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.01 255)" }}>
  <FaultyTerminal />
</div>
```
```tsx
// Old CRT: warm orange + strong barrel distortion + dispersion
<FaultyTerminal tint="oklch(0.72 0.2 45)" curvature={0.45} scanlineIntensity={0.5} chromaticAberration={3} />
```

## Usage Guidelines

- OGL/WebGL client-side rendering: placed within the `"use client"` boundary; SSR only provides fallback static coverage.
- `pause` is not the only freeze switch - the reduced-motion preference will force freeze (or), pay attention to the system settings when debugging animations.
- The root needs to be placed into the `relative overflow-hidden` positioning container and has its own height (such as `h-56`).
- `chromaticAberration` / `glitchAmount` It is very expensive to increase the GPU. Use high values with caution when staying in the background.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
