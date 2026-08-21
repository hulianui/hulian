---
slug: safe-area
name: SafeArea
category: mobile
group: layout
tags: []
exports: [SafeArea]
status: enriched
---

# SafeArea

> Applies device inset padding to keep mobile content outside obstructed regions. · mobile/layout

## When to Use

Use it to keep edge-aligned content clear of a device notch or home indicator. [TabBar](../tab-bar/tab-bar.md) already includes safe-area handling; wrap only custom edge content in SafeArea.

## Import
```ts
import { SafeArea } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| `edges` | `SafeAreaEdge[] \| "all" \| "vertical" \| "horizontal"` | `"all"` | Edges that receive an inset; `SafeAreaEdge = "top"\|"right"\|"bottom"\|"left"` |
| `mode` | `"padding" \| "margin"` | `"padding"` | Applies each inset as padding or margin |
| `min` | `number \| string` | `0` | The minimum value of each inset (number = px or any CSS length), when the env cannot be obtained |
| `as` | `ElementType` | `"div"` | Polymorphic root element |

> Inherits `HTMLAttributes<HTMLElement>` and forwards `className`, `style`, `children`, and other element attributes.

## Examples
```tsx
<SafeArea edges="all" min={0}>
  <Content />
</SafeArea>
```

## Usage Guidelines
- `env(safe-area-inset-*)` on the desktop is always 0. If you want to see the blank space on a non-notch device, you must give `min` (such as `min={16}`) a spacing - this is also the spacing when the real machine does not have a safe zone.
- Numeric `min` values are interpreted as pixels; strings may use any CSS length, such as `"1rem"`.

## Related
[TabBar](../tab-bar/tab-bar.md) · [Fab](../fab/fab.md) · [ActionSheet](../action-sheet/action-sheet.md) · [Picker](../picker/picker.md) · [SwipeAction](../swipe-action/swipe-action.md) · [PullToRefresh](../pull-to-refresh/pull-to-refresh.md)
