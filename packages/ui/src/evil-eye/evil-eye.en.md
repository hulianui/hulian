---
slug: evil-eye
name: EvilEye
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [EvilEye]
status: enriched
---

# EvilEye

> Evil eye of fire · WebGL background · Polar coordinate multi-layered procedural noise draws churning flame pupils + pupil inertia follows the cursor + outer ring diffuse glow (ogl·token adaptive·reduced-motion static degradation) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a highly dramatic main visual background (hero / 404 / startup page) that has a "sense of attention" and can follow the pointer. If you want pure tiled geometric shading, use [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md); if you want the pointer focus to follow but not "eyes" for figurative graphics, use [Spotlight](../spotlight/spotlight.md); if you want water ripple embellishment, use [Ripple](../ripple/ripple.md).

## Import
```ts
import { EvilEye } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| eyeColor | `string` | `--color-chart-3` | Main flame color, any CSS color (hex/oklch/rgb/`var(--…)`). Do not pass the theme token, change the color with light and dark |
| backgroundColor | `string` | Transparent (return to black) | Background color, generally left as the default background of the container |
| intensity | `number` | `1.5` | Luminous intensity magnification, the larger the brightness, the recommended 0.8–2.5 |
| pupilSize | `number` | `0.6` | Pupil size, the larger, the fuller, and the smaller, the narrower, it is recommended 0.2–1.0 |
| irisWidth | `number` | `0.25` | Iris (inner ring flame) width, recommended 0.1–0.4 |
| glowIntensity | `number` | `0.35` | Outer ring glow concentration, recommended 0.1–0.6 |
| scale | `number` | `0.8` | Eye zoom, the larger it is, the more screen it takes up. It is recommended to be 0.5–1.2 |
| noiseScale | `number` | `1.0` | Flame noise texture scaling, the larger the texture, the finer the texture, recommended 0.5–2.0 |
| pupilFollow | `number` | `1.0` | The pupil follows the cursor amplitude, 0 = does not move; with inertial lerp, let go and slowly return to normal |
| flameSpeed | `number` | `1.0` | Flame flow speed, recommended 0.3–2.0 |
| className | `string` | — | Forward the root container, the component defaults to `block h-full w-full`, and the size is determined by the container |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Content layered over the static fallback when reduced motion is preferred or WebGL is unavailable |

## Examples
```tsx
// Default: use theme chart-3 warm orange, pupils follow the cursor
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.01 60)" }}>
  <EvilEye className="absolute inset-0" />
</div>
```
```tsx
// Wallpaper level: pupils do not follow + slow fire
<EvilEye className="absolute inset-0" pupilFollow={0} flameSpeed={0.5} noiseScale={1.3} />
```

## Usage Guidelines

- OGL/WebGL client rendering: placed within the `"use client"` boundary; only the bottom layer of the static fallback pocket appears in the SSR stage, and the first screen vision is subject to the fallback.
- The roots need to be put into the positioning container of `relative` + `overflow-hidden` with its own height (such as `h-64`), otherwise the spread will not be full or overflow.
- The flame can only be seen clearly on a dark background. Please explicitly pass `backgroundColor` on a light base or lay a dark base on the container.
- `pupilFollow` follows dependent pointer events, which is equivalent to 0 for mobiles/pointerless environments.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
