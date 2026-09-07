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

> Reserves content geometry with an animated loading placeholder.

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

ListSkeleton and CardSkeleton use `rows` and `count`, respectively; constrain preset dimensions with an outer `className`. All three presets accept an optional `label` override for the accessible loading message. Without one, they follow `ConfigProvider` and default to Chinese.

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
- The shimmer is a motion-driven `backgroundPosition` tween, not a CSS animation, so Tailwind variants such as `motion-reduce:` cannot reach it. The placeholder block itself stays static DOM, so headless screenshots show its shape without special handling.
- Under `prefers-reduced-motion: reduce` **the component falls back to a static block by itself** (#350). The placeholder geometry stays, only the sweep and its gradient go away, and all three presets share the same primitive so they settle together. The library owns this preference; consumers need to do nothing.
- Presets expose a localized runtime loading label to assistive technology.
- Presets read the runtime locale from `ConfigProvider`, so they are client components; server components can still import and render them.

## Related
[Empty](../empty/empty.md) · [Watermark](../watermark/watermark.md) · [Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md)
