---
slug: masonry
name: Masonry
category: layout
group: container
tags: []
exports: [Masonry]
status: enriched
---

# Masonry

> 瀑布流布局 · 确定性 round-robin 分列(item[i]→第 i%列·SSR 安全·顺序稳定·非 CSS columns 抖动) + 响应式列数(base/sm/md/lg·首帧 base 防 hydration mismatch·挂载后 matchMedia 调整) + 列内外统一 gap(泛型·token 主题) · layout/container

## 何时用

要把一组不等高卡片（图片墙、动态流、产物画廊）铺成参差瀑布流、且要 SSR 安全 + 顺序稳定时用。它走确定性 round-robin 分列（非原生 CSS columns），避免填谷重排导致的顺序脱节与 hydration mismatch。要等比锁单元素用 [AspectRatio](../aspect-ratio/aspect-ratio.md)，要规整等宽布局直接用 grid。

## 导入
```ts
import { Masonry } from "@hulianui/ui"
```

## Props

`Masonry<T>` 泛型组件。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `T[]` | — | 数据源，按源顺序 round-robin 分列。 |
| renderItem* | `(item: T, index: number) => ReactNode` | — | 渲染单个 item，返回节点会被包进列内格子。 |
| columns | `number \| { base?: number; sm?: number; md?: number; lg?: number }` | `3` | 列数。传数字固定；传对象按断点响应式（base 为 SSR/首帧值，挂载后 matchMedia 切换）。 |
| gap | `number` | `16` | 列间 & 列内 item 间距（像素）。 |
| className | `string` | — | 根容器类名。 |

## 示例
```tsx
// 固定 3 列
<Masonry items={tiles} columns={3} gap={16} renderItem={(t) => <Tile tile={t} />} />
```

```tsx
// 响应式列数（base 为首帧/SSR 值）
<Masonry
  items={photos}
  columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
  gap={16}
  renderItem={(photo) => <img src={photo.url} alt={photo.alt} />}
/>
```

## 禁忌 / 坑

- **响应式 columns 首帧用 base**：传对象时 SSR/首帧固定用 `base`，挂载后才按 `matchMedia` 切到当前断点列数——这是为防 hydration mismatch 的刻意设计，别期望首屏就拿到 lg 列数。
- **不做等高填谷**：round-robin 是纯下标取模（`item[i] → 第 i%列`），换来 SSR 一致与顺序稳定，代价是各列高度可能略不平衡；需要严格等高填谷的场景本组件不适用。
- 断点（sm/md/lg=640/768/1024）与 Tailwind 默认对齐，命中最大满足断点否则回落 base。

## 相关
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md)
