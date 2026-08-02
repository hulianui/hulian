---
slug: particles
name: Particles
category: decoration
group: backdrop
tags: [animated]
exports: [Particles]
status: enriched
---

# Particles

> Interactive particle field · Canvas stardust drift + pointer repulsion + DPR scaling + theme-aware foreground token color · decoration/backdrop · #animated

## When to Use

Use it when you need a stardust/particle background that interacts with the mouse (technical Hero, login page). Based on canvas, it has mouse rejection and drift interaction, which is more dynamic but more expensive than pure CSS [Aurora](../aurora/aurora.md); if you only want a static color gradient background, use Aurora; if you want regular dot matrix/grid shading, use [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md).

## Import
```ts
import { Particles } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| quantity | number | 100 | Number of particles |
| staticity | number | 50 | Static coefficient, the larger it is, the less likely it is to follow the mouse (displacement = mouseOffset / (staticity/magnetism)) |
| ease | number | 50 | Easing coefficient, the larger it is, the slower it is (translateX += (target-current)/ease) |
| size | number | 0.4 | Particle base radius (px), finally random in [size, size+2] |
| color | string | `--color-foreground` | Particle color. When omitted, the component reads the theme token and responds to `data-theme`; explicit values accept `#rrggbb`, `#rgb`, or `rgb(r,g,b)` |
| vx | number | 0 | X-axis constant drift speed (px/frame) |
| vy | number | 0 | Y-axis constant drift speed (px/frame) |
| refresh | boolean \| number \| string | — | Refresh signal - force redrawing of particles when the value changes (equivalent to MagicUI refresh) |
| className | string | — | Additional class name for the container div |

## Examples
```tsx
// Theme-colored particles automatically follow light and dark modes.
<div className="relative h-48 overflow-hidden rounded-xl border">
  <Particles quantity={120} />
</div>
```
```tsx
// Explicit color with a slower, less pointer-responsive field.
<Particles quantity={80} staticity={80} ease={80} color="#6366f1" />
```

## Usage Guidelines

- Canvas color prop only accepts `#rrggbb`/`#rgb`/`rgb()` parsing format, **cannot directly pass `var(--token)` or oklch string** - if you want a theme color, do not pass `color` and let it read `--color-foreground` internally, or parse it into rgb first and then pass it (see [[oklch-css-var-color-must-parse-via-offscreen-canvas]]).
- Based on canvas, client rendering is required; the parent container requires `relative` + `overflow-hidden`.
- There is a performance cost to redrawing frame by frame if the quantity is too large (quantity is hundreds or more), and the background layer should be controlled as appropriate.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
