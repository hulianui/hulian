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

> Draggable sticker · Hover/press peel lift + drop shadow + pointer-following highlight (zero dependencies · Pointer Events drag · reduced-motion support) · decoration/overlay-fx · #animated

## When to Use

Use it to decorate a picture by turning it into a "stick" that can be rolled up and dragged in the parent container. It is suitable for interesting logos, medals, and event stickers on marketing pages/portfolios. It is a special skeuomorphism method for pictures; if you want to add luminous strokes or sweeps to any container, use [GlareHover](../glare-hover/glare-hover.md)/[ShineBorder](../shine-border/shine-border.md); if you want a partial magnifying glass for the picture, use [Lens](../lens/lens.md).

## Import
```ts
import { StickerPeel } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| imageSrc * | `string` | — | Sticker image address, rendered in two layers: front sticker + flipped back hem |
| alt | `string` | `""` | Image accessibility description (transparent img alt), decorative stickers can be left blank |
| width | `number` | `200` | Sticker width (px), height is adaptive according to the original proportion of the picture |
| rotate | `number` | `30` | Sticker rotation in degrees |
| peelBackHoverPct | `number` | `30` | Percentage of curling up when hovering (ratio of top uncovered height) |
| peelBackActivePct | `number` | `40` | The curling percentage when active (press and hold), usually larger than hover |
| peelDirection | `number` | `0` | Curling direction angle (deg), the entire sticker rotates together with the curling |
| shadowIntensity | `number` | `0.6` | Floor projection intensity 0~1 (drop-shadow transparency) |
| lightingIntensity | `number` | `0.4` | Mouse follows highlight intensity 0~1, 0 turns off highlight |
| initialPosition | `"center" \| { x: number; y: number }` | `"center"` | The initial placement point of the sticker: centered or pixel offset relative to the upper left corner of the parent container |
| draggable | `boolean` | `true` | Whether to allow dragging within the parent container (automatic clamping back when out of bounds) |

> Also inherits `HTMLAttributes<HTMLDivElement>` (except `children`), and can forward `className`/`style`/events, etc.

## Examples
```tsx
//Default: lift + drag
<StickerPeel imageSrc="/sticker.svg" width={150} rotate={14} />

// Large curling + strong highlights + locked and cannot be dragged
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

- The parent container needs to be `position: relative` + `overflow-hidden`, otherwise the dragging boundary will not be calculated accurately and the sticker will run out of the frame.
- `draggable` is enabled by default and will intercept PointerEvents; if the sticker is placed in a clickable/scrollable area and gesture conflicts need to be evaluated, turn it off as needed.
- The curling/highlight dynamic effect is degraded under reduced-motion, but the sticker body is still visible.

## Related
[BorderBeam](../border-beam/border-beam.md) · [ShineBorder](../shine-border/shine-border.md) · [GlareHover](../glare-hover/glare-hover.md) · [Lens](../lens/lens.md) · [AnimatedBeam](../animated-beam/animated-beam.md) · [OrbitingCircles](../orbiting-circles/orbiting-circles.md)
