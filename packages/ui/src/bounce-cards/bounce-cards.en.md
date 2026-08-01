---
slug: bounce-cards
name: BounceCards
category: data-display
group: collection
tags: [animated]
exports: [BounceCards]
status: enriched
---

# BounceCards

> Fanned bounce cards · Stacked cards springing in from scale zero and pushing aside on hover, with Motion springs and reduced-motion support · data-display/collection · #animated

## When to use

Use BounceCards for a small fanned stack of images or cards that enters sequentially and makes room around the hovered item, often in a marketing hero or album preview. Use [CardSwap](../card-swap/card-swap.md) for an automatically cycling 3D stack, [ChromaGrid](../chroma-grid/chroma-grid.md) for a spotlight card wall, or [Table](../table/table.md) for structured data. children take precedence over images.

## Import
```ts
import { BounceCards } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| images | `string[]` | — | Image URLs aligned by index with transformStyles; mutually exclusive with children. |
| containerWidth | `number` | `400` | Container width in pixels. |
| containerHeight | `number` | `400` | Container height in pixels. |
| animationDelay | `number` | `0.5` | Delay in seconds before entrance begins. |
| animationStagger | `number` | `0.06` | Seconds between adjacent card entrances. |
| transformStyles | `string[]` | Five-card fan | Per-card transforms; entries beyond the array receive no transform. |
| enableHover | `boolean` | `true` | Whether the hovered card straightens and neighbors move aside. |
| pushDistance | `number` | `160` | Neighbor displacement in pixels. |
| className | `string` | — | Root class name. |
| style | `CSSProperties` | — | Root inline styles. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode[]` | Custom cards replacing image rendering; count and transforms align by index. |

## Example
```tsx
<BounceCards containerWidth={460} containerHeight={240}>
  {[<Swatch key="1" label="01" />, <Swatch key="2" label="02" />, <Swatch key="3" label="03" />]}
</BounceCards>
```

Custom fan without hover:
```tsx
<BounceCards enableHover={false} transformStyles={["rotate(8deg) translate(-110px)", "rotate(-2deg)", "rotate(-8deg) translate(110px)"]}>{cards}</BounceCards>
```

## Usage guidelines

- children override images when both are present.
- transformStyles align by index. Add transforms for custom card counts or extra cards stack at the origin.
- animationDelay and animationStagger are seconds, not milliseconds.
- Reduced motion skips the bounce entrance.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
