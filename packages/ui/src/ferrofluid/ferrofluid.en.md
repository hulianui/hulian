---
slug: ferrofluid
name: Ferrofluid
category: decoration
group: backdrop
tags: [animated, webgl]
exports: [Ferrofluid]
status: enriched
---

# Ferrofluid

> Ferrofluid · Liquid-metal WebGL backdrop built from value-noise ridges, smooth blending, flowing rim highlights, and pointer-driven depressions · OGL, theme chart tokens, and a radial-gradient fallback · decoration/backdrop · #animated #webgl

## When to Use

Use it for a liquid-metal glow behind a brand hero or product page. Use [Galaxy](../galaxy/galaxy.md) for deep-space depth, [DotPattern](../dot-pattern/dot-pattern.md) or [GridPattern](../grid-pattern/grid-pattern.md) for geometric texture, or [Spotlight](../spotlight/spotlight.md) for a lightweight pointer focus. Ferrofluid is designed around flowing metallic ridges that deform under the pointer.

## Import
```ts
import { Ferrofluid } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | `string[]` | `--color-chart-1/2/4` | Up to eight fluid colors mapped from low to high across the height field; accepts any CSS colors |
| speed | `number` | `0.5` | Animation-speed multiplier |
| scale | `number` | `1.6` | Noise scale; higher values create finer texture and values below 0.05 are clamped |
| turbulence | `number` | `1` | Turbulence intensity, 0 = nearly stationary smooth liquid surface |
| fluidity | `number` | `0.1` | Smoothness of ridge blending; higher values look more fluid, with a lower limit of 0.001 |
| rimWidth | `number` | `0.2` | Highlight edge width |
| sharpness | `number` | `2.5` | Highlight gamma; higher values tighten the bright bands |
| shimmer | `number` | `1.5` | Low-light variation that creates metallic flashes |
| glow | `number` | `2` | Overall glow multiplier |
| flowDirection | `"up" \| "down" \| "left" \| "right"` | `"down"` | Overall ridge-drift direction |
| opacity | `number` | `1` | Overall opacity, range 0-1 |
| mouseInteraction | `boolean` | `true` | Lets the pointer depress the liquid field and suppress bright bands |
| mouseStrength | `number` | `1` | Pointer influence intensity, only effective when `mouseInteraction=true` |
| mouseRadius | `number` | `0.35` | Normalized pointer influence radius |
| mouseDampening | `number` | `0.15` | Pointer-following damping in seconds; 0 follows immediately |
| dpr | `number` | `min(dpr, 2)` | Upper limit of device pixel ratio, lower it to save GPU |
| className | `string` | - | Root container (or div) |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Static non-WebGL content for SSR, reduced motion, or unavailable WebGL; defaults to a radial gradient |

## Examples
```tsx
// Default: use theme chart token three colors
<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 265)" }}>
  <Ferrofluid />
</div>
```
```tsx
// Slow, large-scale backdrop without pointer interaction
<Ferrofluid speed={0.25} scale={2.4} glow={2.4} mouseInteraction={false} />
```

## Usage Guidelines

- OGL/WebGL renders on the client. SSR and unavailable WebGL show the radial-gradient fallback.
- Place the root in a `relative overflow-hidden` container with an explicit height.
- Metallic highlights read best against a dark background; light surfaces reduce their contrast.
- On high-resolution displays, pass `dpr={1}` to reduce GPU cost. Higher `turbulence` and `shimmer` values increase fragment-shader work.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
