---
slug: aurora
name: Aurora
category: decoration
group: backdrop
tags: [animated]
exports: [Aurora]
status: enriched
---

# Aurora

> Aurora gradient background · Double-layer repeating-linear-gradient lateral interference + radial mask focus + chart token (pure CSS·RSC) · decoration/backdrop · #animated

## When to Use

Use it for a soft, flowing color backdrop behind a hero, landing page, or marketing section. Its pure CSS implementation renders as an RSC without Canvas or WebGL overhead. Use [Particles](../particles/particles.md) for individual particles or pointer interaction, and [Silk](../silk/silk.md) or [Iridescence](../iridescence/iridescence.md) for a more textured WebGL sheen.

## Import
```ts
import { Aurora } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| colors | string[] | `["var(--color-chart-1)","var(--color-chart-2)","var(--color-chart-4)"]` | Ribbon colors; accepts any CSS color and defaults to theme-aware chart tokens |
| blur | number | 30 | Layer blur radius in pixels; 10–80 is recommended, since low values create hard edges and high values diffuse the effect |
| speed | number | 20 | Duration of one animation cycle in seconds; higher values move more slowly |
| showRadialMask | boolean | true | Fade the effect radially toward the corners; disable it to fill the container uniformly |
| className | string | — | Class name forwarded to the Aurora layer for opacity or blend-mode adjustments |
| style | CSSProperties | — | Inline styles passed through to the root container |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | ReactNode | Content layered above the Aurora effect |

## Examples
```tsx
// The aurora is superimposed on the dark background, and the content layer is naturally stacked on the background using relative
<div className="relative h-56 overflow-hidden rounded-xl">
  <Aurora className="absolute inset-0 opacity-80">
    <div className="flex h-full items-center justify-center text-white/80">Aurora</div>
  </Aurora>
</div>
```
```tsx
// Custom warm orange band + slower and softer
<Aurora
  colors={["var(--color-chart-3)", "var(--color-chart-1)", "oklch(0.72 0.22 30)"]}
  blur={40}
  speed={25}
  className="absolute inset-0 opacity-75"
/>
```

## Usage Guidelines

- Give the parent `relative` and `overflow-hidden`, or the oversized moving gradient will escape its bounds.
- Adjust Aurora's own opacity through `className` (the showcases use `opacity-60` through `opacity-90`). Applying opacity to a wrapper also fades its content.

## Related
[DotPattern](../dot-pattern/dot-pattern.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [StripedPattern](../striped-pattern/striped-pattern.md) · [Spotlight](../spotlight/spotlight.md) · [RetroGrid](../retro-grid/retro-grid.md) · [Ripple](../ripple/ripple.md)
