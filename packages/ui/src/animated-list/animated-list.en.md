---
slug: animated-list
name: AnimatedList
category: data-display
group: collection
tags: [animated]
exports: [AnimatedList]
status: enriched
---

# AnimatedList

> Animated list · children fade and move upward in sequence when entering the viewport · data-display/collection · #animated

## When to use

Use AnimatedList to give notifications, feeds, or feature rows a staggered entrance. Prefer a static list when the animation adds no value. Use [Sortable](../sortable/sortable.md) when users need to reorder items.

## Import
```ts
import { AnimatedList } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| stagger | number | — | Delay between adjacent entries in seconds. |
| className | string | — | Container class name. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | ReactNode | Entries animated in render order. |

## Example
```tsx
<AnimatedList className="w-72">
  <Row t="New order" d="$128 · just now" />
  <Row t="Payment received" d="$99 · 1 minute ago" />
  <Row t="New review" d="★★★★★ · 3 minutes ago" />
</AnimatedList>
```

## Usage notes

- Viewport entry is client-side. Offscreen children remain initially hidden, so use care for SSR-critical first-screen content.
- Dynamic insertion changes stagger order; every child needs a stable key.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
