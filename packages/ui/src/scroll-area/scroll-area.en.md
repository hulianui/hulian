---
slug: scroll-area
name: ScrollArea
category: layout
group: container
tags: []
exports: [ScrollArea]
status: enriched
---

# ScrollArea

> Scroll area · Base UI custom thin scroll bar + vertical/horizontal/bidirectional · layout/container

## When to use

Use ScrollArea for constrained content that needs thin, consistent cross-platform scrollbars. It controls scrollbar styling and orientation only. Use [Resizable](../resizable/resizable.md) when users should change the area's size, or [Viewport](../viewport/viewport.md) for container-query layout changes.

## Import
```ts
import { ScrollArea } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| orientation | `"vertical" \| "horizontal" \| "both"` | `"vertical"` | Scroll direction. `both` renders horizontal and vertical bars plus their corner. |
| className | `string` | — | Consumer-supplied size constraint on Root, such as `h-48` or `w-64`; without one, content expands instead of scrolling. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Scroll content. |

## Example
```tsx
// Vertical scrolling requires a height constraint
<ScrollArea className="h-48 w-72 border border-border bg-surface p-4">
  {/* Long content */}
</ScrollArea>
```

```tsx
// Horizontal scrolling
<ScrollArea orientation="horizontal" className="w-72">
  <div className="flex gap-3">{/* Horizontal cards */}</div>
</ScrollArea>
```

## Usage guidelines

- **Scrolling requires a size constraint.** ScrollArea has no intrinsic size. Apply `h-*` for vertical scrolling and `w-*` for horizontal scrolling through `className`; otherwise content expands the container and no scrollbar appears.

## Related
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md) · [FitScreen](../fit-screen/fit-screen.md)
