---
slug: action-sheet
name: ActionSheet
category: mobile
group: overlay
tags: []
exports: [ActionSheet, ActionSheetTrigger, ActionSheetClose, ActionSheetContent]
status: enriched
---

# ActionSheet

> Mobile action sheet · Bottom-up Base UI Dialog using the Drawer motion pattern and CSS motion tokens · Close-on-select actions, destructive state, separate cancel block, and safe-area support · mobile/overlay

## When to Use

Use it to present a bottom sheet of actions such as save, share, or delete on mobile, with a separate Cancel block. Use [Fab](../fab/fab.md) for one persistent primary action. Use [Picker](../picker/picker.md) for wheel-based selection of values such as a time or region.

## Import
```ts
import { ActionSheet, ActionSheetTrigger, ActionSheetClose, ActionSheetContent } from "@hulianui/ui"
```

## Props

`ActionSheet` accepts the Base UI `Dialog.Root` props, including the usual controlled or uncontrolled open state and `onOpenChange`. `ActionSheetTrigger` and `ActionSheetClose` are direct Base UI Dialog counterparts.

**ActionSheetContent — Props**

| Name | Type | Default | Description |
|------|------|------|------|
| `actions` * | `ActionSheetAction[]` | — | Actions listed below; selecting any action closes the sheet |
| `container` | `HTMLElement \| null` | `document.body` | Portal container; pass an ancestor such as a transformed, overflow-hidden device frame to contain both backdrop and sheet |
| `className` | `string` | — | — |

**ActionSheetAction**: `key: string` · `label: ReactNode` · `description?: ReactNode` (supporting text) · `danger?: boolean` (destructive red treatment) · `disabled?: boolean` · `onClick?: () => void`.

## Events

| Event | Type | Description |
|------|------|------|
| `onOpenChange` | `(open: boolean) => void` | Called by `ActionSheet` (`Dialog.Root`) when its open state changes; forwarded from Base UI Dialog |

## Slots

Content injection slot for `ActionSheetContent`:

| Slot | Type | Description |
|------|------|------|
| `title` | `ReactNode` | Top title |
| `description` | `ReactNode` | Supporting text below the title |
| `cancelText` | `ReactNode \| null` | Cancel-button content; defaults to `"\u53d6\u6d88"` (Cancel); pass `null` to hide the cancel block |

## Examples
```tsx
<ActionSheet>
  <ActionSheetTrigger>Open</ActionSheetTrigger>
  <ActionSheetContent
    title="Image actions"
    actions={[
      { key: "save", label: "Save" },
      { key: "delete", label: "Delete", danger: true },
    ]}
  />
</ActionSheet>
```

## Usage Guidelines
- Selecting an action calls its `onClick` before the enclosing Close dismisses the sheet. Do not close it manually.
- The portal defaults to `document.body`. To keep the sheet inside a device frame or demo container, point `container` at the transformed or overflow-hidden ancestor; otherwise the backdrop covers the viewport.

## Related
[TabBar](../tab-bar/tab-bar.md) · [Fab](../fab/fab.md) · [Picker](../picker/picker.md) · [SwipeAction](../swipe-action/swipe-action.md) · [PullToRefresh](../pull-to-refresh/pull-to-refresh.md) · [SafeArea](../safe-area/safe-area.md)
