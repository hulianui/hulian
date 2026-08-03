---
slug: modal
name: Modal
category: feedback
group: overlay
tags: []
exports: [modal, ModalProvider, hulianModalManager]
status: enriched
---

# Modal

> Imperative dialog · Functional confirm/info/success/error/warning API powered by Dialog · feedback/overlay

## When to use

Use Modal to display a confirmation or status message from application logic with one function call, such as confirming deletion or reporting an operation result. Use declarative [Dialog](../dialog/dialog.md) for complex custom content and forms, or [AlertDialog](../alert-dialog/alert-dialog.md) for a destructive decision that cannot be dismissed lightly.

## Import
```ts
import { modal, ModalProvider, hulianModalManager } from "@hulianui/ui"
```

## API / Options

Call `modal.confirm(opts)`, `modal.info`, `modal.success`, `modal.error`, or `modal.warning`; each returns a `ModalInstance`, and the method implies the tone. Mount `ModalProvider` once at the application root, following the Toast pattern.

`ModalOptions` Props:

| Name | Type | Default | Description |
|------|------|------|------|
| `type` | `"confirm" \| "info" \| "success" \| "error" \| "warning"` | — | Tone, normally implied by the imperative method. |

`ModalOptions` Events:

| Event | Type | Description |
|------|------|------|
| `onOk` | `() => void \| Promise<unknown>` | Confirm handler. A returned Promise puts the button in loading state, closes on resolve, and stays open on reject. |
| `onCancel` | `() => void` | Called on Cancel, Escape, or overlay dismissal. |

`ModalOptions` Slots:

| Slot | Type | Description |
|------|------|------|
| `title` | `ReactNode` | Bold primary title. |
| `content` | `ReactNode` | Body content. |
| `okText` | `ReactNode` | Confirm-button copy. Defaults to built-in Chinese `"\u786e\u5b9a"`, meaning “Confirm.” |
| `cancelText` | `ReactNode` | Cancel-button copy. Defaults to built-in Chinese `"\u53d6\u6d88"`, meaning “Cancel”; rendered only for confirm dialogs. |

`ModalInstance` provides `destroy()` to close immediately and `update(next)` to change an open dialog.

## Example
```tsx
// Mount once in the root layout
<ModalProvider />

modal.confirm({
  title: "Delete this record?",
  content: "This action cannot be undone.",
  onOk: () => {},
});

// The confirm button loads until the request resolves
modal.confirm({
  title: "Submit order?",
  content: "Confirming starts the request.",
  onOk: () => fetch("/api/order", { method: "POST" }),
});
```

## Usage guidelines

- Mount exactly one `ModalProvider` at the application root. Imperative calls have nowhere to render without it.
- When `onOk` returns a Promise, only resolve closes automatically. Rejection keeps the dialog open for caller-owned error handling; do not also destroy it in the rejection path.

## Related
[Dialog](../dialog/dialog.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
