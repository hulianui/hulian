---
slug: carousel
name: Carousel
category: data-display
group: collection
tags: []
exports: [Carousel]
status: enriched
---

# Carousel

> Navigates scroll-snap slides with arrows, dots, autoplay, looping, dragging, and keyboard controls. · data-display/collection

## When to use

Use Carousel for equal-width slides shown one at a time, such as a marketing banner, gallery, or feature tour. Use [Card](../card/card.md) or [List](../list/list.md) grid mode for a static multi-card layout.

## Import
```ts
import { Carousel } from "@hulianui/ui"
```

## Props

`CarouselProps` inherits native div properties except `onSelect` and `children`:

| Name | Type | Default | Description |
|------|------|------|------|
| current | `number` | - | Controlled slide index. |
| defaultCurrent | `number` | `0` | Initial uncontrolled index. |
| autoplay | `boolean` | `false` | Autoplay, forced off under reduced motion. |
| autoplayInterval | `number` | `4000` | Autoplay interval in milliseconds. |
| loop | `boolean` | `false` | Returns from the last slide to the first. |
| showArrows | `boolean` | `true` | Shows previous and next controls. |
| showDots | `boolean` | `true` | Shows dot indicators. |
| aria-label | `string` | `"\u8f6e\u64ad"` | Region label; the built-in Chinese means “Carousel.” |
| slideClassName | `string` | - | Class applied to every slide, useful for fixed height and radius. |

## Events

| Event | Type | Description |
|------|------|------|
| onSelect | `(index: number) => void` | Called by arrows, dots, keyboard, autoplay, or drag settling. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | One top-level child per slide. |

## Examples
```tsx
<Carousel className="w-96" aria-label="Home promotions">
  {slides.map((s) => <Slide key={s.title} {...s} />)}
</Carousel>

<Carousel autoplay loop>
  {slides.map((s) => <Slide key={s.title} {...s} />)}
</Carousel>
```

## Usage notes

- `current` makes the component controlled and requires `onSelect`; otherwise use `defaultCurrent`.
- Reduced motion disables autoplay, including in accessibility and test environments.
- Set consistent slide height through `slideClassName` to prevent layout jumps.
- Runtime control labels are dynamic `"\u7b2c N / M \u5f20"` (“Slide N of M”), `"\u4e0a\u4e00\u5f20"` / `"\u4e0b\u4e00\u5f20"` (“Previous” / “Next”), `"\u5e7b\u706f\u7247\u5bfc\u822a"` (“Slide navigation”), and `"\u8f6c\u5230\u7b2c N \u5f20"` (“Go to slide N”).

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
