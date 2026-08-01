---
slug: lanyard
name: Lanyard
category: decoration
group: overlay-fx
tags: [animated]
exports: [Lanyard]
status: enriched
---

# Lanyard

> Lanyard badge · Draggable lanyard badge · Single pendulum + damping spring physical rebound (native PointerEvents + RAF · zero third-party dependence) + SVG secondary Bezier lanyard bends in real time with the swing angle + token color matching (lanyard primary · Work badge surface/border) · reduced-motion Return to position when you let go · decoration/overlay-fx · #animated

## When to Use

Use it for a draggable badge that swings on a damped spring and bends its strap with the current angle, such as on a personal site, team page, or playful hero. Use [GlareHover](../glare-hover/glare-hover.md) for a reflected hover highlight or [BorderBeam](../border-beam/border-beam.md) for a moving border light. Any `children` can fill the front of the badge.

## Import
```ts
import { Lanyard } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| ropeLength | `number` | `120` | Lanyard length px (the resting distance from the top anchor point to the industrial plate hook), the larger the swing, the more stretch and the slower the rebound |
| ropeColor | `string` | `var(--color-primary)` | Lanyard color, the token of the SVG stroke must be prefixed with `--color-` |
| stiffness | `number` | `0.045` | Rebound stiffness (spring constant), the larger, the faster and harder it will return to normal, it is recommended to be 0.02–0.12 |
| damping | `number` | `0.92` | Damping (speed attenuation per frame), the closer it is to 1, the longer the swing, it is recommended to be 0.85–0.97 |
| title | `string` | `"\u745a\u740f \u00b7 HULIAN"` ("Hulian · HULIAN") | Placeholder badge title (only displayed when children are not passed) |
| subtitle | `string` | `"\u62d6\u52a8\u6446\u4e00\u6446"` ("Drag to swing") | Placeholder badge subtitle (only displayed when children are not passed) |
| className | `string` | — | Root container className |
| style | `CSSProperties` | — | Forward the root container inline style |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | The front content of the work badge; if not passed, the placeholder badge will be rendered |

## Examples

```tsx
// Default placeholder badge (fills the relatively positioned stage at a fixed height)
<div className="relative h-80 overflow-hidden rounded-xl">
  <Lanyard className="absolute inset-0" />
</div>

//Long rope·soft hem
<Lanyard
  className="absolute inset-0"
  ropeLength={160}
  stiffness={0.025}
  damping={0.965}
title="Slow Shake Gongpai"
subtitle="Drag and let go to see the rest of the swing"
/>
```

## Usage Guidelines

- The work badges are hung by absolute positioning. The root container must be `relative overflow-hidden` and have a clear height, otherwise the work badges will overflow or be positioned incorrectly (showcases must always be `className="absolute inset-0"` with a fixed height stage).
- `ropeColor` Feed SVG stroke, the token must be prefixed with `--color-`, and bare `var(--primary)` will not be parsed. See [[hulian-token-color-var-needs-color-prefix]].
- Client component (PointerEvents + RAF physical loop), no swing under SSR; under reduced-motion, let go and return to position immediately, without any residual swing.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
