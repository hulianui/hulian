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

> 虚拟滚动 · 包 @tanstack/react-virtual 仅渲染可见区 + 定高/变高(measureElement)双模 + initialRect 首帧可算 + 末行触发 onReachEnd(万行列表/长列表刚需) · data-display/collection

## 何时用

列表上千行、DOM 全量渲染卡顿时用：只渲染视口可见的几十行。配合 `onReachEnd` 可叠加无限加载。需要「滚到底自动拉下一页」而行数不大（无虚拟化）走 [InfiniteScroll](../infinite-scroll/infinite-scroll.md)；二者可组合（VirtualList 管渲染、onReachEnd 触发分页）。

## 导入
```ts
import { VirtualList } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `T[]` | — | 数据数组（泛型）。 |
| itemHeight* | `number｜((index: number) => number)` | — | 定高 px，或返回估算高度的函数（变高，按实测校正）。 |
| height | `number｜string` | `360` | 视口高度，px 或 CSS 长度。 |
| overscan | `number` | `5` | 预渲染屏外条数。 |
| getKey | `(item: T, index: number) => string｜number` | 用下标 | 行 key 提取。 |
| className | `string` | — | — |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onReachEnd | `() => void` | 末行进入视口时回调（配合无限加载）。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| renderItem* | `(item: T, index: number) => ReactNode` | 行渲染函数。 |

## 示例
```tsx
const rows = Array.from({ length: 10000 }, (_, i) => ({ id: i, name: `数据行 ${i + 1}` }));

<VirtualList
  items={rows}
  itemHeight={44}
  height={320}
  getKey={(r) => r.id}
  renderItem={(r) => <Row data={r} />}
/>
```

## 禁忌 / 坑

暂无已知坑。`itemHeight` 传函数为变高模式：返回值只是估算，实际高度由 `measureElement` 实测校正，因此函数返回的近似值越准首帧抖动越小。变高行内容动态变化时务必保证 `getKey` 稳定，否则量测缓存错位。候选坑 `alicloud-oss-s3-compat-list-requires-virtual-host` 属对象存储 List 语义，与本组件无关，不适用。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
