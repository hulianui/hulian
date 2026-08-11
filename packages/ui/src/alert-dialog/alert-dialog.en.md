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
| `AlertDialogContent.description` | `ReactNode` | Supporting copy. **Phrasing content only** (text, `span`, `strong`, `a`) because it renders as a `<p>`; put block-level content in `body`. |
| `AlertDialogContent.body` | `ReactNode` | Main content, rendered below `description` and above the action area. It is not wrapped in a `<p>`, so block-level content such as a summary card or an affected-items list is valid here. |
| `AlertDialogContent.icon` | `ReactNode` | Status icon on the left of the title row. The component only handles flex alignment; supply the color yourself (`text-danger` for destructive actions, `text-warning` for warnings). |
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

With body content and a status icon:
```tsx
<AlertDialog>
  <AlertDialogTrigger className="…">Delete contract template</AlertDialogTrigger>
  <AlertDialogContent
    icon={<WarnIcon className="text-danger" />}
    title="Delete contract template?"
    description="It is removed from the shared, public, and per-company libraries and cannot be restored."
    body={
      <div className="rounded-[var(--radius)] border border-border p-3">
        <div className="font-medium">Full-time employment contract</div>
        <div className="text-xs text-muted-foreground">full-time-contract-copy.docx</div>
      </div>
    }
  >
    <AlertDialogClose className="…">Cancel</AlertDialogClose>
    <AlertDialogClose className="…">Delete permanently</AlertDialogClose>
  </AlertDialogContent>
</AlertDialog>
```

## Usage guidelines

- **`description` accepts phrasing content only** (text, `<span>`, `<strong>`, `<a>`). It renders through `AlertDialog.Description` as a `<p>`, so a `<div>`, `<ul>`, or card inside it is invalid nesting: the browser closes the `<p>` early and React reports a hydration mismatch. **Put block-level content in `body`** instead of working around it with `<span className="block">`.
- `children` is the **bottom action area** — a `justify-end` row of buttons — not the main content. Content placed there is squeezed in beside the buttons. [Dialog](../dialog/dialog.md) is the other way round, where `children` is the content and `footer` holds the actions, so the two are not interchangeable.
- `icon` only handles alignment with the title and description and carries **no color**. Pass `text-danger` for destructive actions or `text-warning` for warnings; otherwise it inherits the normal foreground color.
- The popup has no internal scroll area, unlike Dialog with its `max-h` and scrolling content, so long `body` content pushes the popup past the viewport. Needing long content means the interaction is no longer a forced decision — use Dialog instead.
- Ignoring overlay clicks and Escape is intentional forced-decision behavior. Use Dialog when lightweight dismissal is appropriate.
- A cancel button must use `AlertDialogClose` to close the dialog. Confirmation commonly uses it as well and performs the operation from `onClick`.

## Related
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
