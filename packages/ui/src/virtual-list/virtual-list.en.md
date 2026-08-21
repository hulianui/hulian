---
slug: virtual-list
name: VirtualList
category: data-display
group: collection
tags: []
exports: [VirtualList]
status: enriched
---

# VirtualList

> Renders only visible rows from large lists while preserving scroll position.

## When to use

Use VirtualList when thousands of rows make full DOM rendering slow; it keeps only the visible region and its overscan mounted. Use `onReachEnd` for pagination. For moderate lists that only need bottom-triggered loading, use [InfiniteScroll](../infinite-scroll/infinite-scroll.md).

## Import
```ts
import { VirtualList } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `T[]` | - | Generic data array. |
| itemHeight* | `number\|((index: number) => number)` | - | Fixed height in pixels or an estimated-height function for measured variable rows. |
| height | `number\|string` | `360` | Viewport height in pixels or as a CSS length. |
| overscan | `number` | `5` | Number of off-screen rows to pre-render. |
| getKey | `(item: T, index: number) => string\|number` | Array index | Extracts a stable row key. |
| className | `string` | - | Custom class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onReachEnd | `() => void` | Fires when the last row enters the viewport. |

## Slots

| Slot | Type | Description |
|------|------|------|
| renderItem* | `(item: T, index: number) => ReactNode` | Renders a row. |

## Examples
```tsx
const rows = Array.from({ length: 10000 }, (_, index) => ({ id: index, name: `Row ${index + 1}` }));

<VirtualList
  items={rows}
  itemHeight={44}
  height={320}
  getKey={(row) => row.id}
  renderItem={(row) => <Row data={row} />}
/>
```

## Pitfalls

When `itemHeight` is a function, its result is an estimate corrected by `measureElement`; better estimates reduce initial layout movement. Keep `getKey` stable when variable-height content changes so measurement caches remain aligned.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
