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

> Compares priced items in transposed feature rows with highlights, badges, and sticky headers. · data-display/collection

## When to use

Use PricingTable to compare attributes of plans, products, or models side by side, such as price, context window, and capabilities. Unlike [Table](../table/table.md), whose rows are records, PricingTable treats each column as the compared subject.

## Import
```ts
import { PricingTable } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| columns* | `PricingColumn[]` | - | Compared subject columns. |
| rows* | `PricingRow[]` | - | Attribute and price rows. |
| stickyHeader | `boolean` | `true` | Keeps the header visible while scrolling. |
| className | `string` | - | Root class name. |

`PricingColumn` has `key*`, `title*`, `highlight?`, `badge?`, and `header?`; a custom header replaces the title region. `PricingRow` has `key*`, `label*`, and `values: Record<string, ReactNode>`, keyed by column key.

## Example
```tsx
const columns: PricingColumn[] = [
  { key: "gpt", title: "GPT-5.5" },
  { key: "opus", title: "Claude Opus 4.7", highlight: true, badge: "Recommended" },
  { key: "deepseek", title: "DeepSeek V4" },
];

const rows: PricingRow[] = [
  { key: "in", label: "Input / 1M", values: { gpt: "$5.00", opus: "$5.00", deepseek: "$0.55" } },
  { key: "out", label: "Output / 1M", values: { gpt: "$30.00", opus: "$25.00", deepseek: "$2.20" } },
  { key: "ctx", label: "Context window", values: { gpt: "256K", opus: "200K", deepseek: "128K" } },
];

<PricingTable columns={columns} rows={rows} />
```

## Usage notes

- Every `row.values` key must match a `column.key`; missing keys produce empty cells.
- Badge space is created only by `highlight: true`, so `badge` is meaningful only on highlighted columns.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md) · [List](../list/list.md)
