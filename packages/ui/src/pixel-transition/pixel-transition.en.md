---
slug: pixel-transition
name: PixelTransition
category: decoration
group: overlay-fx
tags: [animated]
exports: [PixelTransition]
status: enriched
---

# PixelTransition

> Pixel-transition card · Switches between two content layers through a randomized pixel curtain on hover, focus, or click · Configurable grid, duration, one-way mode, and token color (Motion instead of GSAP · reduced-motion direct cut) · decoration/overlay-fx · #animated

## When to Use

Use it when a portfolio or CTA card should switch between two real content layers through a pixel-mosaic curtain. It is not a background effect: use [PixelTrail](../pixel-trail/pixel-trail.md) for a pure pixel background, or [GlareHover](../glare-hover/glare-hover.md) for pointer-driven highlighting.

## Import
```ts
import { PixelTransition } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| gridSize | `number` | `7` | Pixel grid side length (total number of blocks gridSize²), the larger, the finer and softer |
| pixelColor | `string` | `"var(--color-foreground)"` | Pixel block coloring, token variable or `currentColor` is recommended |
| animationStepDuration | `number` | `0.3` | The duration of a single transition (seconds), half of the scatter in + half of the scatter, switching at the midpoint |
| once | `boolean` | `false` | Only advance but not retreat: stop at secondContent after activation, leave/out of focus and do not return |
| aspectRatio | `string` | `"4 / 3"` | Container aspect ratio (CSS aspect-ratio writing, such as `"1 / 1"`, `"16 / 9"`) |
| className | `string` | - | Additional class name merged onto the root element |
| style | `CSSProperties` | - | Passthrough to root element |

## Slots

| Slot | Type | Description |
|------|------|------|
| firstContent * | `ReactNode` | Default (static) content, usually a picture/a piece of copy, required |
| secondContent * | `ReactNode` | Active content, revealed through the pixel curtain after hovering/focusing/clicking, required |

## Examples
```tsx
//Hover/focus trigger switch
<PixelTransition
  firstContent={<Face label="Hulian" />}
  secondContent={<Face label="UI library" />}
/>
```
```tsx
// Only advance without retreat (once) · Square
<PixelTransition
  once
  aspectRatio="1 / 1"
  firstContent={<Face label="Click me" />}
  secondContent={<Face label="✓" />}
/>
```

## Usage Guidelines

- `firstContent` / `secondContent` are required double-layer content. Both layers must be 100% full (use `h-full w-full`), otherwise there will be a blank space after the pixel curtain is revealed.
- `pixelColor` uses a variable prefixed with `--color-` (`var(--color-foreground)`) for the token. The bare var is not parsed under Tailwind v4. See [[hulian-token-color-var-needs-color-prefix]].
- Motion driver (not gsap); direct hard cutting under reduced-motion, no scatter-in/out animation.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
