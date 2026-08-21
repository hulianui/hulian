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

> Adds slim custom scrollbars for vertical, horizontal, or two-axis overflow. · layout/container

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
| className | `string` | - | Consumer-supplied size constraint on Root, such as `h-48` or `w-64`; without one, content expands instead of scrolling. |

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
- **The scrollbar is an overlay, so the content must reserve its own gutter.** The bar is absolutely positioned, takes no layout width, and is `w-2` (8px) wide; a horizontal bar is the same height. Give the content at least **`pr-2.5` (10px: an 8px bar plus 2px of breathing room)**, or `pb-2.5` when scrolling horizontally. A smaller gutter such as the common `pr-1` (4px) leaves the bar sitting on top of the rightmost column (#118). This is an explicit convention rather than component behaviour, because only the consumer knows whether the gutter belongs on the content wrapper or on individual columns.
- **Overflow on the undeclared axis is locked (hidden), never silently scrollable.** A `vertical` viewport gets `overflow-x: hidden`, a `horizontal` viewport gets `overflow-y: hidden` (`both` leaves both axes open). Base UI styles the viewport with two-axis `overflow: scroll` and hides the native bars, so content even 1px wider than the viewport used to pan sideways under a trackpad swipe with no scrollbar to explain it, and it looked like a broken layout (#287). Content inside a `vertical` area therefore has to fit its width (`w-full` / `min-w-0` / internal truncation); anything wider is clipped rather than scrollable. Declare `orientation="both"` when you really want two-axis scrolling.

## Related
[Layout](../layout/layout.md) · [AdminLayout](../admin-layout/admin-layout.md) · [Viewport](../viewport/viewport.md) · [Resizable](../resizable/resizable.md) · [AspectRatio](../aspect-ratio/aspect-ratio.md) · [FitScreen](../fit-screen/fit-screen.md)
