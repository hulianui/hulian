---
slug: antigravity
name: Antigravity
category: decoration
group: overlay-fx
tags: [animated]
exports: [Antigravity]
status: enriched
---

# Antigravity

> Antigravity particles · Nearby particles gather into a pulsing orbital ring around the pointer, then ease home when it leaves · Configurable attraction radius, ring, shapes, rotation, and idle animation · Canvas 2D, token colors, and a reduced-motion fallback · decoration/overlay-fx · #animated

## When to Use

Use it for a full particle backdrop whose particles gather around a nearby pointer, then ease back into place, such as a hero or display wall. This is a Canvas 2D attraction field. Use [BlobCursor](../blob-cursor/blob-cursor.md) for a liquid pointer trail, [ClickSpark](../click-spark/click-spark.md) for click bursts, or [BorderBeam](../border-beam/border-beam.md) for a moving border highlight.

## Import
```ts
import { Antigravity } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| count | `number` | `240` | Particle count; higher values cost more, so keep mobile usage at or below 200 |
| magnetRadius | `number` | `130` | Attraction radius in pixels; particles inside this pointer range join the orbit |
| ringRadius | `number` | `56` | Orbital base radius (px) |
| waveSpeed | `number` | `0.4` | Wave speed on the ring (how fast the orbit radius fluctuates with angle/time) |
| waveAmplitude | `number` | `10` | Ring-wave amplitude in pixels; larger values make the orbit rougher and more organic |
| particleSize | `number` | `4` | Particle base size (px); dot=diameter / square=side length / bar=length |
| lerpSpeed | `number` | `0.12` | Target interpolation factor from 0 to 1; higher values track more tightly |
| color | `string` | `var(--color-chart-1)` | Particle color; accepts any CSS color and defaults to a theme-aware token |
| autoAnimate | `boolean` | `false` | Start an automatic pointer path after two seconds of inactivity |
| rotationSpeed | `number` | `0` | The angular speed of the entire ring's rotation over time (rad/s), 0 = no rotation |
| pulseSpeed | `number` | `3` | Scale-pulse speed while particles are attracted |
| shape | `"dot" \| "square" \| "bar"` | `"bar"` | Particle shape |
| className | `string` | — | Class name forwarded to the root canvas wrapper or fallback |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Custom static content for reduced motion or unavailable Canvas 2D |

## Examples
```tsx
//Default short stick particles, covering the positioning parent
<div className="relative h-64 overflow-hidden rounded-xl">
  <Antigravity className="absolute inset-0" />
</div>

// Automatic tour + block + token color matching
<Antigravity
  className="absolute inset-0"
  autoAnimate
  rotationSpeed={0.4}
  shape="square"
  color="var(--color-chart-2)"
/>
```

## Usage Guidelines

- This Canvas 2D client component needs a positioned parent with an explicit height. Use `absolute inset-0` to fill it.
- Token-valued `color` props need the `--color-` prefix. Canvas cannot resolve bare `var(--chart-1)`; use `var(--color-chart-1)`. See [[hulian-token-color-var-needs-color-prefix]].
- `count` directly affects performance. Keep it at or below 200 on mobile and lower-end devices.
- Reduced-motion and unavailable Canvas 2D environments render a static dot field; replace it through `fallback` if needed.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
