---
slug: descriptions
name: Descriptions
category: data-display
group: collection
tags: []
exports: [Descriptions, DescriptionsItem]
status: enriched
---

# Descriptions

> Description list · read-only detail-page key-value fields with horizontal or vertical layout, borders, column spans, skin-only rendering, and RSC support · data-display/collection

## When to use

Use Descriptions for flat read-only fields in a detail page or drawer, such as user, order, or contract information. Use [JsonViewer](../json-viewer/json-viewer.md) for nested JSON, or [List](../list/list.md) for an entry stream with actions.

## Import
```ts
import { Descriptions, DescriptionsItem } from "@hulianui/ui"
```

## Props

`DescriptionsProps`:

| Name | Type | Default | Description |
|------|------|------|------|
| column | `number` | `3` | Columns per row. |
| layout | `"horizontal" \| "vertical"` | `"horizontal"` | Places labels beside or above values. |
| bordered | `boolean` | `false` | Enables a bordered table-like layout. |
| items | `DescriptionsItemData[]` | — | Data-driven entries, taking precedence over child items. |

## Slots

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Upper-left title. |
| extra | `ReactNode` | Upper-right actions. |

`DescriptionsItem` and `DescriptionsItemData` provide `label`, `children`, and `span`. Span defaults to 1 and is clamped to `column`.

## Examples
```tsx
<Descriptions title="User information">
  <DescriptionsItem label="Name">Alex Zhang</DescriptionsItem>
  <DescriptionsItem label="Gender">Male</DescriptionsItem>
  <DescriptionsItem label="Notes" span={3}>VIP customer; prioritize support requests</DescriptionsItem>
</Descriptions>

<Descriptions
  bordered
  title="Order details"
  extra={<a href="#edit">Edit</a>}
  items={[
    { label: "Username", children: "alex" },
    { label: "Address", children: "88 Example Road, Guangzhou", span: 3 },
  ]}
/>
```

## Usage notes

- In bordered mode, spans should fill each row's `column` count or gaps remain. Let long fields occupy a complete row.
- `items` takes precedence when supplied together with `DescriptionsItem` children.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
