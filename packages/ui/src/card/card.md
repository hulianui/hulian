---
slug: card
name: Card
category: data-display
group: collection
tags: []
exports: [Card, CardHeader, CardBody, CardFooter]
status: enriched
---

# Card

> 卡片 · Header/Body/Footer 插槽 · data-display/collection

## 何时用

把一组相关内容圈进带边框/阴影的容器——信息块、统计项、表单分区、列表卡片。需要条目流用 [List](../list/list.md)(其 `grid` 态本身就是卡片栅格)；展示键值对详情用 [Descriptions](../descriptions/descriptions.md)。本组件只是纯容器外壳 + 三段插槽，不含业务逻辑。

## 导入
```ts
import { Card, CardHeader, CardBody, CardFooter } from "@hulianui/ui"
```

## Props

`CardProps` 继承原生 `HTMLAttributes<HTMLDivElement>`，外加 CVA 变体：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| variant | `"outline" \| "elevated" \| "featured"` | `"outline"` | 外观：描边 / 投影抬升 / 强调 |

`CardHeader` / `CardBody` / `CardFooter` 均为插槽容器，接收原生 div 属性 + `children`。

## 示例
```tsx
<Card variant="elevated" className="w-64">
  <CardHeader>瑚琏卡片</CardHeader>
  <CardBody>宗庙玉器，至美又大用。</CardBody>
  <CardFooter>footer 区</CardFooter>
</Card>
```

## 禁忌 / 坑

- 别用 Card 包 loading 骨架屏——参见 [[loading-skeletons-are-chromeless-dont-wrap-in-card]]：骨架按惯例是无边框无阴影的纯 shimmer 块，套 Card 会显得过重。
- 列表/侧栏里 Card 末行(时间戳/meta 行)若设了外层 `min-height` 又用 flex 撑高，meta 行可能漏到卡片背景外——参见 [[grid-card-button-tail-row-leaks-outside-when-outer-min-height]]。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
