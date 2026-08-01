---
slug: shape-blur
name: ShapeBlur
category: decoration
group: overlay-fx
tags: [animated]
exports: [ShapeBlur]
status: enriched
---

# ShapeBlur

> Soft shape highlight · Pointer-revealed WebGL geometry · Rounded rectangle, filled circle, ring, and triangle + damped soft-light edge reveal (ogl · tokens · reduced-motion static fallback) · decoration/overlay-fx · #animated

## When to Use

Use it for restrained geometric decoration that appears under a soft pointer-following light, such as empty space in a hero or the base of a card. For merging fluid blobs, use [MetaBalls](../meta-balls/meta-balls.md); for image magnification, use [Lens](../lens/lens.md).

## Import
```ts
import { ShapeBlur } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| variation | `"round-rect"｜"circle-fill"｜"circle-stroke"｜"triangle"` | `"round-rect"` | Shape presets (rounded rectangle stroke/solid circle/ring stroke/triangle fill) |
| shapeSize | `number` | `1.2` | Overall shape scale mapped to the GLSL `u_shapeSize` uniform |
| roundness | `number` | `0.4` | Rounding degree, only round-rect takes effect, 0=right angle |
| borderSize | `number` | `0.05` | Stroke width, only stroke type (round-rect/circle-stroke) takes effect |
| circleSize | `number` | `0.3` | Soft circle radius that follows the mouse (buff area size) |
| circleEdge | `number` | `0.5` | Soft light round edge feathering, the bigger the softer it is |
| color | `string` | `var(--color-foreground)` | Shape main color, CSS color or token prefixed with `--color-` |
| damping | `number` | `8` | Mouse following damping, the larger it is, the faster it follows, and the smaller it is, the lazier it is |
| className | `string` | — | Additional class name for the root container div |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | reduced-motion / static alternative without WebGL (default foreground radial glow div) |

## Examples
```tsx
//Default rounded rectangle stroke (container needs relative + overflow-hidden, move the mouse to reveal)
<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 270)" }}>
  <ShapeBlur variation="round-rect" />
</div>
```
```tsx
// Ring Stroke + Warm Gold + Larger Light Circle
<ShapeBlur variation="circle-stroke" color="oklch(0.82 0.16 75)" circleSize={0.35} />
```

## Usage Guidelines

- The `color` token must be prefixed with `--color-`, and the bare `var(--primary)` shader will not parse it; leave `color` blank in the showcase to use the default foreground. See [[hulian-token-color-var-needs-color-prefix]].
- WebGL/ogl component, client-side rendering only; StrictMode double-mounted canvas context reuse risk, see [[webgl-canvas-loseContext-poisons-strictmode-remount]].
- The component comes with `absolute inset-0 z-0`, and the parent container needs `relative` + `overflow-hidden`; `roundness`/`borderSize` only takes effect under the corresponding variation. Don’t forget to compare when changing the shape.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
