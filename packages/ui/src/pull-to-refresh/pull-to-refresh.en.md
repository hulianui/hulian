---
slug: pull-to-refresh
name: PullToRefresh
category: mobile
group: gesture
tags: []
exports: [PullToRefresh]
status: enriched
---

# PullToRefresh

> Pull to refresh · Damped top-edge pull + armed threshold + release trigger + refresh state held until the returned promise settles (zero dependencies · Pointer Events) · mobile/gesture

## When to Use

Used when the scrollable list/page is on top and the pull-down triggers data refresh. Use [SwipeAction](../swipe-action/swipe-action.md) to slide the list row horizontally to reveal the action button; this component only performs the vertical pull-down to refresh gesture.

## Import
```ts
import { PullToRefresh } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| `threshold` | `number` | `64` | Pull-down threshold px to trigger refresh |
| `resistance` | `number` | `0.5` | Pull-down damping coefficient (0-1, the smaller it is, the "heavy" it is) |
| `className` | `string` | — | — |

## Events

| Event | Type | Description |
|------|------|------|
| `onRefresh` * | `() => Promise<void> \| void` | Trigger the refresh callback; remain "refreshing" during the return of Promise, and rebound after the end |

## Slots

| Slot | Type | Description |
|------|------|------|
| `children` * | `ReactNode` | Scrollable content |
| `pullingText` | `ReactNode` | Pulling-state content; defaults to `\u4e0b\u62c9\u5237\u65b0` ("Pull to refresh") |
| `armedText` | `ReactNode` | Armed-state content; defaults to `\u91ca\u653e\u5237\u65b0` ("Release to refresh") |
| `refreshingText` | `ReactNode` | Refreshing-state content; defaults to `\u5237\u65b0\u4e2d\u2026` ("Refreshing...") |

## Examples
```tsx
<PullToRefresh onRefresh={async () => { await load(); }}>
  <List />
</PullToRefresh>
```

## Usage Guidelines
- To keep the indicator visible while loading, `onRefresh` must **return a promise** that resolves after the data is ready. Returning void rebounds immediately.
- The pull-down gesture is only entered when the content is scrolled to the top, and will not be accidentally triggered during scrolling.

## Related
[SwipeAction](../swipe-action/swipe-action.md) · [TabBar](../tab-bar/tab-bar.md) · [Fab](../fab/fab.md) · [ActionSheet](../action-sheet/action-sheet.md) · [Picker](../picker/picker.md) · [SafeArea](../safe-area/safe-area.md)
