---
slug: blob-cursor
name: BlobCursor
category: decoration
group: overlay-fx
tags: [animated]
exports: [BlobCursor]
status: enriched
---

# BlobCursor

> Liquid cursor · A leading droplet and spring-following trail merge through an SVG gooey filter · Motion springs, token colors, and reduced-motion handling · decoration/overlay-fx · #animated

## When to Use

Use it when the pointer itself should look like liquid mercury, with springy droplets that merge as they trail through a creative hero or landing page. Use [TextCursor](../text-cursor/text-cursor.md) for a glyph trail inside a container, [Antigravity](../antigravity/antigravity.md) for a full particle field, or [Crosshair](../crosshair/crosshair.md) for target tracking.

## Import
```ts
import { BlobCursor } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| trailCount | `number` | `3` | Droplet count including the leader; higher values create a denser trail |
| sizes | `number[]` | `[56, 116, 72]` | Droplet diameters in pixels, selected by index and cycled when the array is shorter than `trailCount` |
| innerSizes | `number[]` | `[18, 32, 22]` | Inner-highlight diameters in pixels, cycled in the same way |
| fillColor | `string` | `var(--color-primary)` | Water drop body fill color, any CSS color can be passed |
| innerColor | `string` | `var(--color-primary-foreground)` | inner highlight color |
| square | `boolean` | `false` | Use square instead of circular droplets; combine with `gooey` for a liquid-block effect |
| gooey | `boolean` | `true` | Enable the SVG merge filter; when disabled, droplets remain separate |
| gooeyStrength | `number` | `16` | Gaussian-blur deviation for the merge filter; higher values merge across a wider area with softer edges |
| leadStiffness | `number` | `500` | Leader spring stiffness; higher values follow the pointer more tightly |
| trailStiffness | `number` | `120` | Trailing water drop spring stiffness (the smaller the trail, the longer the trail) |
| damping | `number` | `28` | Spring damping (the bigger it is, the less rebound it will be and the stickier it will be) |
| zIndex | `number` | `50` | Container stacking level; the droplet layer uses `pointer-events:none` |
| className | `string` | — | Class name forwarded to the relative root that fills its parent |
| style | `CSSProperties` | — | Inline styles forwarded to the root container |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Content layered above the droplets with relative `z-10` positioning |

## Examples
```tsx
//Default: Move to the stage and see the jelly follow
<div className="relative h-64 overflow-hidden rounded-xl">
  <BlobCursor>
    <div className="pointer-events-none flex h-full items-center justify-center">
Move mouse →
    </div>
  </BlobCursor>
</div>

// Long tail (5 drops · low stiffness and more sloppy)
<BlobCursor trailCount={5} trailStiffness={70} />
```

## Usage Guidelines

- This client component fills its parent. Give that parent an explicit height and `overflow-hidden`.
- The recommended array length for `sizes`/`innerSizes` is ≥ `trailCount`. If it is insufficient, it will be recycled according to the index. No error will be reported but the color matching/size will be repeated.
- Disabling `gooey` separates the droplets; square droplets no longer read as a merged liquid block.
- The droplet layer uses `pointer-events:none`, so it does not intercept underlying interaction. Put overlay content in `children`, which receives `z-10`.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
