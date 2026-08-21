---
slug: aspect-ratio
name: AspectRatio
category: layout
group: container
tags: []
exports: [AspectRatio]
status: enriched
---

# AspectRatio

> 把图片、视频或任意内容锁在固定的宽高比里 · layout/container

## 何时用

要把图片/视频/卡片锁成固定宽高比（16/9、1/1、4/3）、随宽度自适应高度且不抖动时用。它只锁比例（纯 CSS、可 RSC）；要按容器宽度重排布局用 [Viewport](../viewport/viewport.md)，要把固定设计稿等比缩放铺满用 [FitScreen](../fit-screen/fit-screen.md)。

## 导入
```ts
import { AspectRatio } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| ratio | `number` | `1` | 宽高比（宽 / 高），如 `16/9`、`1`、`4/3`。 |

继承 `HTMLAttributes<HTMLDivElement>`。

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 子元素（通常 img/video），自动铺满容器。 |

## 示例
```tsx
// 16:9 媒体容器，宽度由外层决定，高度自动
<div className="w-64">
  <AspectRatio ratio={16 / 9}>
    <img src="..." alt="..." />
  </AspectRatio>
</div>
```

```tsx
// 1:1 头像/缩略图
<div className="w-40">
  <AspectRatio ratio={1}>
    <Fill label="1 / 1" />
  </AspectRatio>
</div>
```

## 禁忌 / 坑

- **`ratio` 是数字不是字符串**：传 `16 / 9` 这种除式或 `1.7778`，不要传 `"16/9"`。
- **宽度由外层给**：容器宽度自适应父级，高度据 ratio 推导；外层不限宽时会撑满可用宽度。子元素无需自己写 `w-full h-full`，组件已让其铺满。

## 相关
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [ScrollArea](../scroll-area/scroll-area.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [FitScreen](../fit-screen/fit-screen.md)
