---
slug: scroll-stack
name: ScrollStack
category: data-display
group: collection
tags: [animated]
exports: [ScrollStack, ScrollStackItem]
status: enriched
---

# ScrollStack

> Scroll-stacked cards · native scroll and RAF pin cards in sequence with progressive scale, optional rotation and depth blur, token styling, and a static reduced-motion layout · data-display/collection · #animated

## When to use

Use ScrollStack for a narrative section where cards pin and stack as the user scrolls, such as feature explanations or process steps. Use [InfiniteMenu](../infinite-menu/infinite-menu.md) for draggable spherical exploration, or [FlyingPosters](../flying-posters/flying-posters.md) for a flying poster corridor.

## Import
```ts
import { ScrollStack, ScrollStackItem } from "@hulianui/ui"
```

## Props

`ScrollStack`:

| Name | Type | Default | Description |
|------|------|------|------|
| itemDistance | `number` | `100` | Initial vertical distance between cards in pixels. |
| itemScale | `number` | `0.03` | Scale increment between adjacent cards. |
| itemStackDistance | `number` | `30` | Vertical offset between pinned cards in pixels. |
| stackPosition | `string` | `"20%"` | Container position at which a card starts pinning. |
| scaleEndPosition | `string` | `"10%"` | Position at which a card reaches its target scale. |
| baseScale | `number` | `0.85` | Base scale of the first, lowest card. |
| rotationAmount | `number` | `0` | Rotation increment per stacked layer in degrees. |
| blurAmount | `number` | `0` | Blur increment for lower cards in pixels; disabled under reduced motion. |
| className | `string` | — | Class name added to the scroll root. |
| style | `CSSProperties` | — | Inline styles forwarded to the scroll root. |

## Events

| Event | Type | Description |
|------|------|------|
| onStackComplete | `() => void` | Called when the last card enters the pinning region. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Card content, normally wrapped in `ScrollStackItem`; elements marked `data-scroll-stack-card` participate. |

`ScrollStackItem` accepts `{ children?: ReactNode; itemClassName?: string }`.

## Examples
```tsx
<div className="h-[28rem] overflow-hidden rounded-xl border border-border">
  <ScrollStack>
    <ScrollStackItem>Card 1</ScrollStackItem>
    <ScrollStackItem>Card 2</ScrollStackItem>
    <ScrollStackItem>Card 3</ScrollStackItem>
  </ScrollStack>
</div>

<ScrollStack rotationAmount={3} blurAmount={2}>{/* ... */}</ScrollStack>
```

## Usage notes

- The outer viewport must have a fixed height and `overflow-hidden`; otherwise there is no scroll distance for pinning.
- Wrap cards in `ScrollStackItem` or add `data-scroll-stack-card` so they are included in measurements.
- Reduced motion switches to a static layout and disables `blurAmount`. Do not rely on stacking to convey essential information.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
