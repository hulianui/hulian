---
slug: skeleton
name: Skeleton
category: data-display
group: placeholder
tags: []
exports: [Skeleton, TableSkeleton, CardSkeleton, ListSkeleton]
status: enriched
---

# Skeleton

> 骨架屏 · shimmer 高光占位(text/circle/rect) + 无边框组合预设 CardSkeleton/ListSkeleton/TableSkeleton · data-display/placeholder

## 何时用

数据加载中、需要给页面留出与真实内容同形的占位时用 `Skeleton`，列表/卡片/表格场景直接用对应预设少写排版。它表达「正在加载」——加载完成但确实没数据用 [Empty](../empty/empty.md)；表格本体用 [Table](../table/table.md)/[ProTable](../pro-table/pro-table.md)，加载态再叠 `TableSkeleton`。

## 导入
```ts
import { Skeleton, TableSkeleton, CardSkeleton, ListSkeleton } from "@hulianui/ui"
```

## Props

`Skeleton` 继承 `div` 原生属性（`style` 除外），并带 CVA 变体：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| shape | `"text" \| "circle" \| "rect"` | `"text"` | 占位形状 |

预设组件 `ListSkeleton` / `CardSkeleton` 用各自的计数 prop（`rows` / `count`）控制数量，尺寸靠外层 `className` 约束。

## 示例
```tsx
// 基础三形状（尺寸由 className 控制）
<Skeleton className="w-32" />
<Skeleton shape="circle" className="size-10" />
<Skeleton shape="rect" className="h-16 w-32" />

// 组合预设
<div className="w-72"><ListSkeleton rows={3} /></div>
<div className="w-full max-w-md"><CardSkeleton count={2} /></div>
```

## 禁忌 / 坑

- 骨架本身是「无 chrome」的占位，预设（Card/List/Table）不自带边框/卡片容器；别再外层套一层 Card 造成双重边框。
- shimmer 是纯 CSS 动画，与图表/canvas 那类 rAF 动画不同，headless 截图能正常显形，无需特殊处理。

## 相关
[Empty](../empty/empty.md) · [Watermark](../watermark/watermark.md) · [Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md)
