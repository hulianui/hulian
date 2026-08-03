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

> An empty state with a built-in illustration, title, description, action area, and two sizes.

## When to use

Use Empty after a list, table, or search has finished loading with no content, explaining why and what to do next. Use [Skeleton](../skeleton/skeleton.md) while loading, [Watermark](../watermark/watermark.md) for sensitive-content overlays, or built-in empty states in [Table](../table/table.md) and [ProTable](../pro-table/pro-table.md).

## Import
```ts
import { Empty } from "@hulianui/ui"
```

## Props

Inherits all native `div` attributes except `title`, which is redefined as ReactNode.

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm" \| "md"` | `"md"` | Component size. |

## Slots

| Slot | Type | Description |
|------|------|------|
| icon | `ReactNode` | Custom illustration; defaults to an empty box, while `null` removes the icon area. |
| title | `ReactNode` | Primary heading. |
| description | `ReactNode` | Supporting explanation. |
| children | `ReactNode` | Actions rendered below the description. |

## Examples
```tsx
// Default
<Empty title="No data" description="This list does not contain any items yet" />

// With an action
<Empty title="No projects yet" description="Create your first project to get started">
  <Button size="sm">Create project</Button>
</Empty>
```

## Pitfalls

- Avoid replacing an entire persistent region with `if (!data.length) return <Empty />`; that unmounts scroll containers, forms, and other stateful children. See [[conditional-empty-return-unmounts-persistent-children]].

## Related
[Skeleton](../skeleton/skeleton.md) · [Watermark](../watermark/watermark.md) · [Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md)
