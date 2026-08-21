---
slug: card-swap
name: CardSwap
category: data-display
group: collection
tags: [animated]
exports: [CardSwap]
status: enriched
---

# CardSwap

> Card shuffle · Automatically cycling perspective stack with front-card drop, depth progression, queue return, compound Card skin, Motion, and reduced-motion support · data-display/collection · #animated

## When to use

Use CardSwap for an automatically cycling perspective stack in a marketing edge composition or centered gallery. Use [BounceCards](../bounce-cards/bounce-cards.md) for a static fanned entrance or [ChromaGrid](../chroma-grid/chroma-grid.md) for spotlight reveal. Use `<CardSwap.Card>` for the built-in skin or any custom element; at least two cards are required to cycle.

## Import
```ts
import { CardSwap } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| width | `number` | `380` | Card width in pixels. |
| height | `number` | `280` | Card height in pixels. |
| cardDistance | `number` | `56` | Horizontal and depth separation. |
| verticalDistance | `number` | `64` | Vertical step distance. |
| delay | `number` | `5000` | Cycle interval in milliseconds. |
| pauseOnHover | `boolean` | `false` | Whether hover pauses cycling. |
| skewAmount | `number` | `5` | `skewY` depth angle in degrees. |
| easing | `"elastic" \| "smooth"` | `"elastic"` | Bouncy or restrained transition. |
| placement | `"bottom-right" \| "center"` | `"bottom-right"` | Edge-overflow marketing layout or fully visible centered stack. |
| className | `string` | - | Root class name. |
| style | `CSSProperties` | - | Root inline styles. |

## Events

| Event | Type | Description |
|------|------|------|
| onCardClick | `(index: number) => void` | Reports the clicked child's original index. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Cards, preferably `<CardSwap.Card>`; two or more are needed for cycling. |

## Example
```tsx
<div className="relative h-96 overflow-hidden rounded-xl">
  <CardSwap width={300} height={200} delay={3000} placement="center" pauseOnHover>
    <CardSwap.Card><p className="text-sm font-semibold">Real-time sync</p><p className="mt-2 text-xs">Millisecond updates across devices.</p></CardSwap.Card>
    <CardSwap.Card>...</CardSwap.Card><CardSwap.Card>...</CardSwap.Card>
  </CardSwap>
</div>
```

Smooth restrained motion:
```tsx
<CardSwap easing="smooth" skewAmount={4} placement="center" delay={2600}>{cards}</CardSwap>
```

## Usage guidelines

- The default bottom-right placement intentionally overflows. Use center in ordinary gallery containers.
- One card remains static.
- delay is milliseconds, and the parent needs relative positioning and overflow clipping.
- Reduced motion stops automatic cycling.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
