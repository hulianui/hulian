---
slug: magnet
name: Magnet
category: decoration
group: overlay-fx
tags: [animated]
exports: [Magnet]
status: enriched
---

# Magnet

> Pointer magnetism · Pulls content toward a nearby pointer using center distance and strength, then returns smoothly on leave (zero dependencies · reduced-motion clamp) · decoration/overlay-fx · #animated

## When to Use

Wrap a single interactive element—such as a button, icon, or CTA—when it should move toward a nearby pointer and return smoothly on leave. For an area-wide cursor or image trail, use [GhostCursor](../ghost-cursor/ghost-cursor.md) or [ImageTrail](../image-trail/image-trail.md). Magnet inherits `HTMLAttributes<HTMLDivElement>` except `children` and forwards the remaining div attributes.

## Import
```ts
import { Magnet } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| padding | `number` | `100` | Detection radius in pixels, extending beyond the element boundary |
| disabled | `boolean` | `false` | Disables attraction and returns the element smoothly to its origin without changing the DOM structure |
| magnetStrength | `number` | `2` | Attraction divisor: displacement = pointer-to-center distance / this value. Lower values are stronger; recommended range 1–6 |
| activeTransition | `string` | `"transform 0.3s ease-out"` | Transition while the element follows the pointer |
| inactiveTransition | `string` | `"transform 0.5s ease-in-out"` | Inactive state transition (when leaving homing) |
| wrapperClassName | `string` | — | Additional class name for the outer wrapper div |
| innerClassName | `string` | — | Forward the inner displacement div (carrying transform) additional className |
| style | `CSSProperties` | — | Inline styles forwarded to the outer wrapper div |

> Also inherits all standard div properties of `Omit<HTMLAttributes<HTMLDivElement>, "children">`.

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Magnetic content (buttons, icons, cards, etc.) |

## Examples
```tsx
<Magnet padding={100} magnetStrength={2}>
  <button className="rounded-full bg-primary px-6 py-3 text-primary-foreground">
    Pull me
  </button>
</Magnet>
```

Strong suction (almost sticking to the pointer):
```tsx
<Magnet padding={140} magnetStrength={1}>
  <Pill label="Strong attraction" />
</Magnet>
```

## Usage Guidelines

- `magnetStrength` is a divisor, not a multiplier: the smaller the value, the stronger the suction force (=1 almost sticks to the pointer), don’t understand it the other way around.
- Reduced-motion limits displacement and keeps the interaction subtle. Do not rely on magnetic movement for essential actions.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
