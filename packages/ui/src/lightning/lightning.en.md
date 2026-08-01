---
slug: lightning
name: Lightning
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Lightning]
status: enriched
---

# Lightning

> Electric arc aurora · fBm-noise arc/aurora-column WebGL background · Inverse-distance glow + randomized flashes (ogl · token colors · reduced-motion static fallback) · decoration/backdrop · #animated #webgl

## When to Use

Use it when you need a vertical arc/aurora glow background and a technological hero with random flashes. For a single stable volumetric beam use [LightPillar](../light-pillar/light-pillar.md); for a radial beam use [LightRays](../light-rays/light-rays.md); for a falling beam use [Lightfall](../lightfall/lightfall.md).

## Import
```ts
import { Lightning } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| hue | `number` | `230` | Lightning hue (0–360, HSV color wheel), only effective when `color` is not passed. Example 30 warm orange / 120 turquoise / 280 magenta |
| color | `string` | `undefined` | Explicit lightning color. When set, it overrides `hue`; use `var(--color-chart-1)` for theme-aware token color |
| xOffset | `number` | `0` | Horizontal offset (clip-space), positive values push to the right, negative values push to the left |
| speed | `number` | `1` | Animation speed factor, the larger the factor, the faster the flashing/surging |
| intensity | `number` | `1` | Brightness intensity, the larger, the brighter and the thicker |
| size | `number` | `1` | Noise scale, the larger the bifurcation, the finer the bifurcation, the smaller the more macroscopic |
| className | `string` | — | Additional class name for the root container or fallback div |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static replacement content without WebGL, default token vertical glow gradient |

## Examples
```tsx
// Default hue is blue-violet (230); give the container a height and clip overflow.
<div className="relative h-64 overflow-hidden rounded-xl bg-black">
  <Lightning />
</div>
```
```tsx
// Use a chart token that adapts to light and dark themes.
<Lightning color="var(--color-chart-1)" intensity={1.2} />
```

## Usage Guidelines

- Choose one of `color` and `hue`: if `color` is passed, `hue` will be invalid. For token adaptation, `color="var(--color-chart-1)"` is preferred.
- ogl/WebGL client only; SSR/no WebGL has fallback (token gradient), and is also degraded under reduced-motion.
- `color` must use the `--color-` prefix token when passing CSS variables. The bare `var(--primary)` shader does not parse, see [[hulian-token-color-var-needs-color-prefix]].
- Fullscreen background layers in a non-cascading context parent of an opaque background may be obscured by the parent background, see [[webgl-canvas-rendered-but-invisible-negative-zindex-covered]].

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
