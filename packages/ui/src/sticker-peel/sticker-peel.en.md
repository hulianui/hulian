---
slug: sticker-peel
name: StickerPeel
category: decoration
group: overlay-fx
tags: [animated]
exports: [StickerPeel]
status: enriched
---

# StickerPeel

> Draggable sticker · A two-layer image peels on hover or press, casts a configurable shadow, follows pointer light, and can be dragged within its parent · Native Pointer Events, no added dependency, and reduced-motion support · decoration/overlay-fx · #animated

## When to Use

Use StickerPeel for logos, badges, or campaign artwork that should feel like a physical sticker users can lift and reposition. It is image-specific and intentionally playful. Choose [GlareHover](../glare-hover/glare-hover.md) or [ShineBorder](../shine-border/shine-border.md) to animate an arbitrary container, or [Lens](../lens/lens.md) to magnify part of an image.

## Import
```ts
import { StickerPeel } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| imageSrc * | `string` | - | Image URL used for both the sticker face and its vertically flipped peel-back layer |
| alt | `string` | `""` | Native image alternative text; leave empty only when the sticker is decorative |
| width | `number` | `200` | Sticker width in pixels; the image preserves its intrinsic aspect ratio |
| rotate | `number` | `30` | Rotation applied to the printed image, in degrees |
| peelBackHoverPct | `number` | `30` | Percentage of the sticker height revealed from the top while hovered |
| peelBackActivePct | `number` | `40` | Percentage revealed while pressed; normally larger than the hover value |
| peelDirection | `number` | `0` | Rotation of the complete sticker and peel direction, in degrees |
| shadowIntensity | `number` | `0.6` | Drop-shadow opacity from 0 to 1 |
| lightingIntensity | `number` | `0.4` | Pointer-following highlight opacity from 0 to 1; 0 removes the highlight layer |
| initialPosition | `"center" \| { x: number; y: number }` | `"center"` | Initial position preset or pixel translation from the parent's top-left origin |
| draggable | `boolean` | `true` | Enable Pointer Events dragging; coordinates are clamped to the parent's measured bounds during drag and after resize or orientation changes |

> Also inherits `HTMLAttributes<HTMLDivElement>` except `children`, forwarding `className`, `style`, and native event handlers to the draggable root.

## Examples
```tsx
// Peel on hover or press, then drag within the parent
<StickerPeel imageSrc="/sticker.svg" width={150} rotate={14} />

// Deeper peel, stronger highlight, and fixed placement
<StickerPeel
  imageSrc="/sticker.svg"
  width={170}
  peelBackHoverPct={42}
  peelBackActivePct={55}
  lightingIntensity={0.7}
  draggable={false}
/>
```

## Usage Guidelines

- The root is absolutely positioned. Give its parent `position: relative`, explicit dimensions, and `overflow: hidden`; drag coordinates are clamped against that parent's current content box.
- With `draggable=true`, the root captures pointer input and uses `touch-none`. Disable dragging when the sticker overlaps scrolling or clickable controls that must receive those gestures.
- Reduced motion removes peel transitions and drag-induced tilt. Hover/press peel states and the pointer highlight still render, but update without motion; the sticker image always remains visible.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
