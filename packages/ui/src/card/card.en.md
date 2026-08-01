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

> Card · Header, Body, and Footer slots · data-display/collection

## When to use

Use Card to group related content in a bordered or elevated container. Use [List](../list/list.md) for an item stream or grid, and [Descriptions](../descriptions/descriptions.md) for key-value details. Card is a structural shell with no business behavior.

## Import
```ts
import { Card, CardHeader, CardBody, CardFooter } from "@hulianui/ui"
```

## Props

`CardProps` inherits `HTMLAttributes<HTMLDivElement>` and adds a CVA variant:

| Name | Type | Default | Description |
|------|------|------|------|
| variant | `"outline" \| "elevated" \| "featured"` | `"outline"` | Border, raised shadow, or emphasized appearance. |

`CardHeader`, `CardBody`, and `CardFooter` accept native div properties and `children`.

## Example
```tsx
<Card variant="elevated" className="w-64">
  <CardHeader>Hulian Card</CardHeader>
  <CardBody>Designed for beauty and practical use.</CardBody>
  <CardFooter>Footer</CardFooter>
</Card>
```

## Usage notes

- Do not wrap loading skeletons in Card. [[loading-skeletons-are-chromeless-dont-wrap-in-card]] explains why shimmer placeholders conventionally avoid borders and shadows.
- A fixed outer minimum height combined with flex stretching can push a final metadata row outside the card background; see [[grid-card-button-tail-row-leaks-outside-when-outer-min-height]].

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
