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

> 滚到接近底部时自动加载下一批内容 · data-display/collection

## 何时用

滚动接近底部时自动拉取下一页、直到 `hasMore=false` 显示完结文案。零依赖、包住已渲染列表即可。当列表行数大到全量 DOM 卡顿，应改用 [VirtualList](../virtual-list/virtual-list.md)（仅渲染可见区）并用其 `onReachEnd` 触发加载；本组件适合行数中等、无需虚拟化的场景。

## 导入
```ts
import { InfiniteScroll } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| hasMore* | `boolean` | - | 是否还有更多；false 时停止观察并显示完结文案。 |
| threshold | `number` | `100` | 距底多少 px 提前触发（IntersectionObserver rootMargin）。 |
| className | `string` | - | - |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onLoadMore* | `() => Promise<void>｜void` | 触底加载回调；返回 Promise 期间不重复触发。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 已渲染的列表内容。 |
| loadingText | `ReactNode` | 加载中文案。 |
| finishedText | `ReactNode` | 完结文案。 |

## 示例
```tsx
function Feed() {
  const [items, setItems] = useState(() => Array.from({ length: 15 }, (_, i) => i + 1));
  const hasMore = items.length < 45;
  const loadMore = () =>
    fetchNextPage().then((page) => setItems((prev) => [...prev, ...page]));

  return (
    <div className="h-72 overflow-y-auto">
      <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore}>
        {items.map((n) => <Row key={n} data={n} />)}
      </InfiniteScroll>
    </div>
  );
}
```

## 禁忌 / 坑

暂无已知坑。`onLoadMore` 务必返回 Promise（异步加载）——组件靠这个 Promise 的 pending 期做加载锁防重入；返回 void 同步加载则失去防抖，快速滚动可能多次触发。哨兵自动向上寻找可滚动祖先作 IntersectionObserver 的 root，故外层需有明确的 `overflow-y-auto` 滚动容器，否则退化到视口监听。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
