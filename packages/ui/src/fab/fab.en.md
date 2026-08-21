---
slug: fab
name: Fab
category: mobile
group: nav
tags: []
exports: [Fab]
status: enriched
---

# Fab

> Places a prominent floating mobile action button above page content. · mobile/nav

## When to Use

Use it when one primary page action, such as create, back to top, or share, needs a persistent floating entry point. A speed dial can reveal several related actions. Use [TabBar](../tab-bar/tab-bar.md) for top-level app navigation, or [ActionSheet](../action-sheet/action-sheet.md) for a dismissible list of actions that opens after a tap.

## Import
```ts
import { Fab } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| `label` | `string` | - | Main button text (extended capsule state); provides the rear main button to change to "icon + text" adaptive capsule, and defaults to aria-label |
| `actions` | `FabAction[]` | - | speed-dial sub-action; if provided, click the main button to expand/collapse, otherwise directly trigger onClick |
| `position` | `"bottom-right" \| "bottom-left" \| "bottom-center"` | `"bottom-right"` | Welt position |
| `size` | `"sm" \| "md"` | `"md"` | md=56px main button, sm=48px (compact scene) |
| `draggable` | `boolean` | `false` | Press and drag to reposition (displacement >3px is regarded as dragging, onClick will not be triggered this time) |
| `aria-label` | `string` | `"\u64cd\u4f5c"` ("Action") | Main Button Accessibility Label |
| `className` | `string` | - | - |

**FabAction**: `key: string` · `icon: ReactNode` · `label?: string` (displayed on the side of the icon as aria-label when expanded) · `onClick?: () => void`.

## Events

| Event | Type | Description |
|------|------|------|
| `onClick` | `() => void` | Main button click without actions |

## Slots

| Slot | Type | Description |
|------|------|------|
| `icon` | `ReactNode` | Main button icon (default Plus); rotated 45° when speed-dial is expanded |

## Examples
```tsx
<Fab
  actions={[
{ key: "search", icon: <Search />, label: "search" },
{ key: "share", icon: <Share />, label: "share" },
  ]}
/>
```

Draggable mode (`draggable` defaults to `false`; holding does nothing until enabled):

```tsx
<Fab draggable label="Hold and drag" icon={<GripVertical />} onClick={() => alert("Create")} />
```

## Usage Guidelines
- The root uses `fixed` positioning at a viewport corner. In a gallery or bounded container, override it to `absolute` through `className`, and give the container `position: relative` and `overflow-hidden`.
- With `actions`, the main button expands or collapses the speed dial and does not call `onClick`. Without `actions`, it calls `onClick` directly.
- `draggable` defaults to `false`; holding the button without enabling it intentionally causes no movement.
- A drag farther than 3px suppresses the release click to prevent accidental activation.
- The drag offset is written on the inline `transform` of the root node, and is only the internal state of the component: it is not persisted and is not controlled (no `onDragEnd` / controlled position input parameter). Refresh or remount will return to the edge specified by `position`.
- Dragging is relative to the press point and is not clamped to viewport bounds. It can move off-screen; bounded demos should use `overflow-hidden`.
- Draggable mode applies `touch-action: none` to the main button, so touch gestures on it drag the button instead of scrolling the page.

## Related
[TabBar](../tab-bar/tab-bar.md) · [ActionSheet](../action-sheet/action-sheet.md) · [Picker](../picker/picker.md) · [SwipeAction](../swipe-action/swipe-action.md) · [PullToRefresh](../pull-to-refresh/pull-to-refresh.md) · [SafeArea](../safe-area/safe-area.md)
