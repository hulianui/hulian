---
slug: tilted-card
name: TiltedCard
category: data-display
group: collection
tags: [animated]
exports: [TiltedCard]
status: enriched
---

# TiltedCard

> Tilting card · pointer-driven perspective and spring rotateX/Y, hover scaling, a pointer-following caption, Motion, and reduced-motion support · data-display/collection · #animated

## When to use

Use TiltedCard as a lightweight primitive for adding pointer-driven 3D tilt, scaling, and a floating caption to an image or content card. Use [ProfileCard](../profile-card/profile-card.md) for a structured profile, [PixelCard](../pixel-card/pixel-card.md) for pixel waves, or [MagicBento](../magic-bento/magic-bento.md) for a spotlight grid.

## Import
```ts
import { TiltedCard } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| imageSrc | `string` | — | Image URL filling the card; it can be combined with or replaced by `children`. |
| altText | `string` | `"Tilted card"` | Accessible image alternative; replace the generic default with content-specific text. |
| containerHeight | `CSSProperties["height"]` | `"300px"` | Perspective container height. |
| containerWidth | `CSSProperties["width"]` | `"100%"` | Perspective container width. |
| cardHeight | `CSSProperties["height"]` | `"300px"` | Tilting card height. |
| cardWidth | `CSSProperties["width"]` | `"300px"` | Tilting card width. |
| scaleOnHover | `number` | `1.1` | Hover scale. |
| rotateAmplitude | `number` | `14` | Maximum tilt in degrees. |
| showTooltip | `boolean` | `true` | Shows the pointer-following caption when content exists. |
| displayOverlayContent | `boolean` | `false` | Shows `overlayContent`. |
| className | `string` | — | Class name merged into the outer `<figure>`. |
| style | `CSSProperties` | — | Inline styles merged into the perspective container. |

## Slots

| Slot | Type | Description |
|------|------|------|
| captionText | `ReactNode` | Pointer-following caption; empty content renders no caption. |
| overlayContent | `ReactNode` | Badge or title raised above the card and moving with its tilt. |
| children | `ReactNode` | Card content above the image and below the overlay. |

## Examples
```tsx
<TiltedCard
  cardWidth="240px" cardHeight="240px"
  containerWidth="240px" containerHeight="240px"
  captionText="Hover me"
>
  <div className="flex h-full flex-col items-center justify-center gap-2 p-6">
    <p className="text-lg font-semibold text-foreground">Hulian UI</p>
  </div>
</TiltedCard>

<TiltedCard
  imageSrc="/cover.jpg" altText="Cover"
  displayOverlayContent
  overlayContent={<span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs text-primary-foreground">NEW</span>}
/>
```

## Usage notes

- Tilt requires a pointing device. Keep essential information available on touch and keyboard-only devices.
- Container and card dimensions are separate; normally set matching pairs to avoid unexpected offsets.
- Reduced motion disables tilt. [[motion-v12-interrupted-animation-promise-never-settles]]: when composing additional Motion sequences, an interrupted animation promise may never settle.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
