---
slug: pricing-table
name: PricingTable
category: data-display
group: collection
tags: []
exports: [PricingTable]
status: enriched
---

# PricingTable

> 定价对比矩阵 · 行列转置(列=被比项/模型·行=属性/价目) + 列高亮描边 + 角标(推荐/最佳性价比) + 表头吸顶 + 窄屏横滚(复用 ScrollArea·区别 Table 行=记录·模型市场定价对照刚需) · data-display/collection

## 何时用

横向对比若干「被比项」的属性矩阵——典型如模型/套餐定价对照（列 = 模型，行 = 输入价/上下文/视觉…），可高亮某列并打「推荐」角标。与 [Table](../table/table.md) 的本质区别：Table 一行 = 一条记录、纵向罗列；PricingTable 行列转置、列才是主体，专做对比。

## 导入
```ts
import { PricingTable } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| columns* | `PricingColumn[]` | — | 被比项列定义 |
| rows* | `PricingRow[]` | — | 属性/价目行定义 |
| stickyHeader | `boolean` | `true` | 表头吸顶 |
| className | `string` | — | 根节点类名 |

`PricingColumn`：`key*`（与 row.values 的键对应）、`title*`（列标题）、`highlight?`（高亮列：描边 + 角标位）、`badge?`（高亮角标如「推荐」）、`header?`（列头富内容，提供则替换 title 区）。
`PricingRow`：`key*`、`label*`（首列属性名）、`values: Record<string, ReactNode>`（各列单元格，键为 column.key）。

## 示例
```tsx
const columns: PricingColumn[] = [
  { key: "gpt", title: "GPT-5.5" },
  { key: "opus", title: "Claude Opus 4.7", highlight: true, badge: "推荐" },
  { key: "deepseek", title: "DeepSeek V4" },
];

const rows: PricingRow[] = [
  { key: "in",  label: "输入价 / 1M", values: { gpt: "$5.00",  opus: "$5.00",  deepseek: "$0.55" } },
  { key: "out", label: "输出价 / 1M", values: { gpt: "$30.00", opus: "$25.00", deepseek: "$2.20" } },
  { key: "ctx", label: "上下文窗口",  values: { gpt: "256K",   opus: "200K",   deepseek: "128K" } },
];

<PricingTable columns={columns} rows={rows} />
```

## 禁忌 / 坑

- `row.values` 的键必须与 `column.key` 一一对应，缺键的格子会空——新增列记得同步补全所有行的 values。
- 高亮角标位由 `highlight: true` 撑出，`badge` 只在 highlight 列上有意义。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md) · [List](../list/list.md)
