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

> 动效列表 · 子项逐个淡入上移入场(motion + 进入视口) · data-display/collection · #animated

## 何时用

进入视口时让一组子项逐个淡入上移入场，用于通知流、动态 feed、特性条目等需要「依次出现」节奏的列表。只要静态列表无需入场动画就别用它（省掉 motion + 视口监听）；要拖拽排序用 [Sortable](../sortable/sortable.md)。

## 导入
```ts
import { AnimatedList } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children | ReactNode | — | 列表子项（每个子项依次入场） |
| stagger | number | — | 相邻子项入场间隔（秒） |
| className | string | — | 容器类名 |

## 示例
```tsx
<AnimatedList className="w-72">
  <Row t="新订单" d="¥128 · 刚刚" />
  <Row t="付款成功" d="¥99 · 1 分钟前" />
  <Row t="新评价" d="★★★★★ · 3 分钟前" />
</AnimatedList>
```

## 禁忌 / 坑

- 入场由「进入视口」触发（motion），是客户端组件；元素在视口外时保持初始隐藏态，依赖 SSR 首屏可见的内容慎用。
- 子项依赖渲染顺序逐个 stagger，动态增删子项会重新编排顺序——稳定 key 必给。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
