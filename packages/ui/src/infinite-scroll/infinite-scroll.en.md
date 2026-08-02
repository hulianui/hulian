---
slug: infinite-scroll
name: InfiniteScroll
category: data-display
group: collection
tags: []
exports: [InfiniteScroll]
status: enriched
---

# InfiniteScroll

> IntersectionObserver-based incremental loading with scroll-ancestor detection, a re-entry lock, and a completed state.

## When to use

Use InfiniteScroll to fetch another page as a moderate-sized list approaches its bottom, stopping when `hasMore=false`. Use [VirtualList](../virtual-list/virtual-list.md) when rendering all rows would create too many DOM nodes; its `onReachEnd` can trigger the same pagination logic.

## Import
```ts
import { InfiniteScroll } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| hasMore* | `boolean` | — | Whether more data exists; false stops observation and shows the finished content. |
| threshold | `number` | `100` | Distance in pixels before the bottom that triggers loading through `rootMargin`. |
| className | `string` | — | Custom class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onLoadMore* | `() => Promise<void>\|void` | Loads the next page; a returned Promise prevents repeat triggers while pending. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Already rendered list content. |
| loadingText | `ReactNode` | Loading message; the built-in runtime default is `"\u52a0\u8f7d\u4e2d\u2026"` ("Loading..."). |
| finishedText | `ReactNode` | Completion message; the built-in runtime default is `"\u6ca1\u6709\u66f4\u591a\u4e86"` ("No more items"). |

## Examples
```tsx
function Feed() {
  const [items, setItems] = useState(() => Array.from({ length: 15 }, (_, index) => index + 1));
  const hasMore = items.length < 45;
  const loadMore = () =>
    fetchNextPage().then((page) => setItems((previous) => [...previous, ...page]));

  return (
    <div className="h-72 overflow-y-auto">
      <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore}>
        {items.map((item) => <Row key={item} data={item} />)}
      </InfiniteScroll>
    </div>
  );
}
```

## Pitfalls

Return a Promise from asynchronous `onLoadMore` work so the pending-state lock can prevent duplicate requests. The sentinel automatically chooses a scrollable ancestor as the IntersectionObserver root; provide a clear `overflow-y-auto` container or it falls back to viewport observation.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
