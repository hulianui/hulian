---
slug: swipe-action
name: SwipeAction
category: mobile
group: gesture
tags: []
exports: [SwipeAction]
status: enriched
---

# SwipeAction

> Swipe actions · Horizontal row translation reveals configurable actions on either side · mobile/gesture

## When to Use

Use it when the list row needs to slide horizontally to reveal operation buttons such as "delete/pin/mark as read" (WeChat conversation list interaction). Use [PullToRefresh](../pull-to-refresh/pull-to-refresh.md) to trigger the refresh of the entire column; the resident button in the row can be placed directly in the content without sliding.

## Import
```ts
import { SwipeAction } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| `left` | `SwipeActionButton[]` | — | Action displayed when sliding out left (content moves right) |
| `right` | `SwipeActionButton[]` | — | Action displayed when sliding out right (content moves left) |
| `threshold` | `number` | `0.5` | The threshold value of letting go to trigger full expansion (ratio of action area width 0-1) |
| `className` | `string` | — | — |

**SwipeActionButton**: `key: string` · `label: ReactNode` · `tone?: "default" \| "primary" \| "danger" \| "success" \| "warning"` (background color, default) · `onClick?: () => void`.

## Events

| Event | Type | Description |
|------|------|------|
| `onOpenChange` | `(side: "left" \| "right" \| null) => void` | Expand/collapse callback (null=collapse) |

## Slots

| Slot | Type | Description |
|------|------|------|
| `children` * | `ReactNode` | Row content (following the content layer of translateX) |

## Examples
```tsx
<SwipeAction
  left={[{ key: "read", label: "Read", tone: "primary" }]}
  right={[{ key: "del", label: "Delete", tone: "danger" }]}
>
  <Row />
</SwipeAction>
```

## Usage Guidelines
- Use Pointer Events to determine the main axis: only when the horizontal displacement is dominant will it be taken over as sliding, and when the vertical displacement is dominant, the outer list will be allowed to scroll - so it will not block vertical scrolling when placed in a scrollable list.
- `threshold` is a 0–1 ratio, not a pixel value. On release, the drag must exceed that fraction of the action area's width to stay open; otherwise it rebounds closed.

## Related
[PullToRefresh](../pull-to-refresh/pull-to-refresh.md) · [TabBar](../tab-bar/tab-bar.md) · [Fab](../fab/fab.md) · [ActionSheet](../action-sheet/action-sheet.md) · [Picker](../picker/picker.md) · [SafeArea](../safe-area/safe-area.md)
