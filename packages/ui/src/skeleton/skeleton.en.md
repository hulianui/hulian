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

> Shimmering text, circle, and rectangle placeholders with borderless card, list, and table presets.

## When to use

Use Skeleton to reserve content-shaped space while data loads. Use ListSkeleton, CardSkeleton, or TableSkeleton to avoid rebuilding common layouts. Use [Empty](../empty/empty.md) only after loading completes without data; pair table presets with [Table](../table/table.md) or [ProTable](../pro-table/pro-table.md).

## Import
```ts
import { Skeleton, TableSkeleton, CardSkeleton, ListSkeleton } from "@hulianui/ui"
```

## Props

`Skeleton` inherits native `div` attributes except `style` and provides a CVA shape variant:

| Name | Type | Default | Description |
|------|------|------|------|
| shape | `"text" \| "circle" \| "rect"` | `"text"` | Placeholder shape. |

ListSkeleton and CardSkeleton use `rows` and `count`, respectively; constrain preset dimensions with an outer `className`.

## Examples
```tsx
// Three base shapes sized through className
<Skeleton className="w-32" />
<Skeleton shape="circle" className="size-10" />
<Skeleton shape="rect" className="h-16 w-32" />

// Composed presets
<div className="w-72"><ListSkeleton rows={3} /></div>
<div className="w-full max-w-md"><CardSkeleton count={2} /></div>
```

## Pitfalls

- Presets intentionally omit chrome. Do not add an unnecessary Card wrapper that creates duplicate borders.
- Shimmer uses CSS rather than requestAnimationFrame, so headless screenshots show its shape without special handling.
- Presets expose the runtime status label `"\u52a0\u8f7d\u4e2d"` ("Loading") to assistive technology.

## Related
[Empty](../empty/empty.md) · [Watermark](../watermark/watermark.md) · [Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md)
