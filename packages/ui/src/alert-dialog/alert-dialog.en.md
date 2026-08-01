---
slug: alert-dialog
name: AlertDialog
category: feedback
group: overlay
tags: []
exports: [AlertDialog, AlertDialogTrigger, AlertDialogClose, AlertDialogContent]
status: enriched
---

# AlertDialog

> Confirmation dialog · Base UI forced decision without overlay or Escape dismissal, powered by Dialog · feedback/overlay

## When to use

Use AlertDialog before a destructive or irreversible action, such as deletion, clearing data, or leaving unsaved work. Overlay clicks and Escape deliberately do not close it; the user must choose Cancel or Confirm. Use [Dialog](../dialog/dialog.md) for a normally dismissible dialog or [Modal](../modal/modal.md) for an imperative one-line confirmation.

## Import
```ts
import { AlertDialog, AlertDialogTrigger, AlertDialogClose, AlertDialogContent } from "@hulianui/ui"
```

## Props

`AlertDialog`, `AlertDialogTrigger`, and `AlertDialogClose` are thin wrappers around their Base UI AlertDialog primitives. Trigger and Close accept `className` or `render` to supply an element. `AlertDialogContent` adds HulianUI styling:

| Name | Type | Default | Description |
|------|------|------|------|
| `AlertDialogContent.className` | `string` | — | Content-container class name. |

## Events

| Event | Type | Description |
|------|------|------|
| `AlertDialog.onOpenChange` | `(open: boolean) => void` | Called when the open state changes; forwarded to Base UI AlertDialog Root. |

## Slots

| Slot | Type | Description |
|------|------|------|
| `AlertDialogContent.title` * | `ReactNode` | Required title and accessible label. |
| `AlertDialogContent.description` | `ReactNode` | Supporting copy. |
| `AlertDialogContent.children` | `ReactNode` | Bottom action area for Cancel and Confirm buttons; use `AlertDialogClose` for cancellation. |

## Example
```tsx
<AlertDialog>
  <AlertDialogTrigger className="…">Delete project</AlertDialogTrigger>
  <AlertDialogContent title="Delete project?" description="This cannot be undone and project data will be permanently removed.">
    <AlertDialogClose className="…">Cancel</AlertDialogClose>
    <AlertDialogClose className="…">Delete</AlertDialogClose>
  </AlertDialogContent>
</AlertDialog>
```

## Usage guidelines

- Ignoring overlay clicks and Escape is intentional forced-decision behavior. Use Dialog when lightweight dismissal is appropriate.
- A cancel button must use `AlertDialogClose` to close the dialog. Confirmation commonly uses it as well and performs the operation from `onClick`.

## Related
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
