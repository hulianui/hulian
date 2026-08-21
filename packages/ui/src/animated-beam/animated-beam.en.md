---
slug: animated-beam
name: AnimatedBeam
category: decoration
group: overlay-fx
tags: [animated]
exports: [AnimatedBeam]
status: enriched
---

# AnimatedBeam

> Animated light beam · Streamer curve connecting two elements (motion gradient + SVG + ResizeObserver) · decoration/overlay-fx · #animated

## When to Use

Use it when you want to connect two DOM nodes in the canvas with a flowing curve (architecture diagram, integration diagram, AI data flow, "convergence to hub" animation). It relies on `containerRef`/`fromRef`/`toRef` to measure the endpoint geometry and draw SVG curves, which can be stacked to form a network. To orbit the light point of a single container border, use [BorderBeam](../border-beam/border-beam.md); to rotate the icon along a circle, use [OrbitingCircles](../orbiting-circles/orbiting-circles.md).

## Import
```ts
import { AnimatedBeam } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| containerRef* | `RefObject<HTMLElement \| null>` | - | Positioning reference container, must be `position:relative` |
| fromRef* | `RefObject<HTMLElement \| null>` | - | starting element ref |
| toRef* | `RefObject<HTMLElement \| null>` | - | end element ref |
| curvature | `number` | `0` | Curvature (>0 convex) |
| reverse | `boolean` | `false` | Beam reverse flow |
| duration | `number` | `4` | Duration of one pass in seconds |
| delay | `number` | `0` | Start delay in seconds |
| pathColor | `string` | `var(--color-border)` | Base path color |
| pathWidth | `number` | `2` | Base path width |
| pathOpacity | `number` | `0.2` | Base path opacity |
| gradientStartColor | `string` | `var(--color-chart-1)` | Beam-gradient start color |
| gradientStopColor | `string` | `var(--color-chart-2)` | Beam-gradient end color |
| startXOffset / startYOffset | `number` | `0` | Start-point offset |
| endXOffset / endYOffset | `number` | `0` | End-point offset |
| className | `string` | - | Class name forwarded to the SVG |

## Examples

```tsx
"use client";
function Demo() {
  const container = useRef<HTMLDivElement>(null);
  const from = useRef<HTMLDivElement>(null);
  const to = useRef<HTMLDivElement>(null);
  return (
    <div ref={container} className="relative flex items-center justify-between">
      <div ref={from} className="size-12 rounded-full bg-surface" />
      <div ref={to} className="size-12 rounded-full bg-surface" />
      {/* reverse controls flow: false = left to right; true = right to left. */}
      <AnimatedBeam containerRef={container} fromRef={from} toRef={to} reverse={false} />
    </div>
  );
}
```

## Usage Guidelines

- This client component measures refs, so its consumer must use `"use client"`. The `containerRef` element must use `position: relative`, or the path coordinates will be misaligned.
- `reverse` controls the horizontal scan direction independently of endpoint order: `false` moves left to right and `true` moves right to left. For beams converging on a center node, reverse the beam on the right.
- Token-valued color props need the `--color-` prefix; see [[hulian-token-color-var-needs-color-prefix]].
- Endpoints and the beam share a container. Give endpoints a layer such as `z-10` so they render above the beam.
- When the system prefers reduced motion, the travelling light and its gradient are skipped and only the static connector line remains. That line carries the "A connects to B" information, so it is not dropped along with the animation.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md) · [ProgressiveBlur](../progressive-blur/progressive-blur.md)
