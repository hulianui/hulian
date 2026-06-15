---
slug: empty
name: Empty
category: data-display
group: placeholder
tags: []
exports: [Empty]
status: enriched
---

# Empty

> 空状态 · 图标+标题+描述+操作槽 + 内置空箱图标 + sm/md(零依赖·RSC) · data-display/placeholder

## 何时用

列表/表格/搜索结果无数据时用，给用户「为什么空 + 下一步做什么」（通过 `children` 放操作按钮）。它表达「已加载完但没内容」——加载中的占位用 [Skeleton](../skeleton/skeleton.md)；防泄密遮罩用 [Watermark](../watermark/watermark.md)；表格自带空态可直接用 [Table](../table/table.md)/[ProTable](../pro-table/pro-table.md)。

## 导入
```ts
import { Empty } from "@hulianui/ui"
```

## Props

继承 `div` 的所有原生属性（`title` 除外，已重定义为 ReactNode）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm" \| "md"` | `"md"` | 尺寸 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| icon | `ReactNode` | 自定义插画/图标。默认内置空箱图标，传 `null` 则不渲染图标区 |
| title | `ReactNode` | 主标题 |
| description | `ReactNode` | 辅助描述 |
| children | `ReactNode` | 操作区（按钮等），渲染在描述下方 |

## 示例
```tsx
// 默认
<Empty title="暂无数据" description="当前列表还没有任何内容" />

// 带操作
<Empty title="还没有项目" description="创建第一个项目开始使用">
  <Button size="sm">新建项目</Button>
</Empty>
```

## 禁忌 / 坑

- 别把「整个列表区是否渲染」和 Empty 绑死成 `if (!data.length) return <Empty/>`——若同区域有需保活的持久子组件（如已挂载的滚动容器、表单），条件 return 会把它们卸载重挂。参见 [[conditional-empty-return-unmounts-persistent-children]]。

## 相关
[Skeleton](../skeleton/skeleton.md) · [Watermark](../watermark/watermark.md) · [Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md)
