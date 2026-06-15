---
slug: bento-grid
name: BentoGrid
category: data-display
group: collection
tags: []
exports: [BentoGrid, BentoCard]
status: enriched
---

# BentoGrid

> 错落栅格 · BentoGrid/BentoCard 复合 + 跨列跨行 + hover CTA(纯 CSS·RSC) · data-display/collection

## 何时用

用错落响应式栅格展示一组特性/能力卡片（落地页特性区、产品亮点墙），靠 `className` 上的 `sm:col-span-2` 等让卡片跨列跨行形成「便当盒」节奏。要纯数据二维表格用 [Table](../table/table.md)；要列表页查询区+工具栏的企业表格用 [ProTable](../pro-table/pro-table.md)。

## 导入
```ts
import { BentoGrid, BentoCard } from "@hulianui/ui"
```

## Props

### BentoGrid
继承 `HTMLAttributes<HTMLDivElement>`，无自有 prop——容器，靠 `className` 调栅格列数。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children | ReactNode | — | 一组 `BentoCard` |
| ...div | HTMLAttributes\<HTMLDivElement\> | — | 透传（`className` 控列数等） |

### BentoCard
继承 `Omit<HTMLAttributes<HTMLDivElement>, "title">`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| title | ReactNode | — | 卡片标题 |
| description | ReactNode | — | 描述 |
| icon | ReactNode | — | 左上图标/装饰 |
| cta | ReactNode | — | 底部行动区（按钮/链接） |
| children | ReactNode | — | 自定义卡片内容 |
| ...div | Omit\<HTMLAttributes\<HTMLDivElement\>, "title"\> | — | 透传（用 `className="sm:col-span-2"` 跨列） |

## 示例
```tsx
import { Zap, Shield } from "lucide-react";

<BentoGrid className="w-full max-w-2xl">
  <BentoCard
    className="sm:col-span-2"
    icon={<Zap />}
    title="极速"
    description="纯 CSS 优先，零运行时开销"
  />
  <BentoCard icon={<Shield />} title="可靠" description="WAI-ARIA + 测试覆盖" />
</BentoGrid>
```

## 禁忌 / 坑

- 跨列/跨行靠卡片自身 `className`（如 `sm:col-span-2`），不是 props——别去找 `span` 这类 prop。
- `BentoCard` 的 `title` 被 `Omit` 掉了原生 `title` 属性，传 `title` 即卡片标题节点，不会渲染成 HTML tooltip。
- 纯 CSS + RSC，无客户端依赖，可直接在 Server Component 里用。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
