---
slug: json-viewer
name: JsonViewer
category: data-display
group: collection
tags: []
exports: [JsonViewer, valueType, jsonPath]
status: enriched
---

# JsonViewer

> Inspects collapsible JSON values with syntax coloring, copying, and depth controls. · data-display/collection

## When to use

Use JsonViewer to inspect arbitrary nested JSON in gateway logs, API debuggers, or configuration previews. Use [Descriptions](../descriptions/descriptions.md) for flat key-value details. JsonViewer is read-only and designed for deep trees.

## Import
```ts
import { JsonViewer, valueType, jsonPath } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| data* | `unknown` | - | Any JSON-compatible value. |
| rootName | `string` | - | Optional root label such as `"response"`. |
| defaultExpandedDepth | `number` | `1` | Nodes expand initially when `depth < defaultExpandedDepth`; direct root children have depth 1. |
| maxAutoExpandKeys | `number` | `50` | Child-count threshold above which an object or array starts collapsed. |
| className | `string` | - | Root class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onCopyPath | `(path: string) => void` | Called after copying a node value and its JSON path. |

## Examples
```tsx
<JsonViewer data={response} />

<JsonViewer data={usage} defaultExpandedDepth={3} />
```

## Usage notes

- JsonViewer is read-only. `onCopyPath` reports copying and never changes `data`.
- Objects with more than `maxAutoExpandKeys` children start collapsed for performance; expand them manually.
- The copy control uses built-in Chinese `"\u590d\u5236"` (“Copy”) and changes to `"\u5df2\u590d\u5236"` (“Copied”).

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [EditableTable](../editable-table/editable-table.md) · [List](../list/list.md)
