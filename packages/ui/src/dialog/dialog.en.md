---
slug: dialog
name: Dialog
category: feedback
group: overlay
tags: []
exports: [Dialog, DialogTrigger, DialogClose, DialogContent]
status: enriched
---

# Dialog

> Dialog · Base UI Portal and focus trap · feedback/overlay

## When to use

Use Dialog to interrupt the current flow with a form, details, or confirmation above an overlay. It includes a Portal, focus containment, and Escape dismissal. Use [Modal](../modal/modal.md) for one-line imperative confirm or status calls, [AlertDialog](../alert-dialog/alert-dialog.md) when the user must explicitly decide, or [Drawer](../drawer/drawer.md) for a sliding panel.

## Import
```ts
import { Dialog, DialogTrigger, DialogClose, DialogContent } from "@hulianui/ui"
```

## Props

`Dialog`, `DialogTrigger`, and `DialogClose` are thin wrappers around the matching Base UI primitives. Dialog forwards Root props such as `open`, `defaultOpen`, and `onOpenChange`; Trigger and Close support `render` to supply the rendered element. `DialogContent` adds HulianUI styling:

| Name | Type | Default | Description |
|------|------|------|------|
| `DialogContent.title` * | `string` | — | Visible title and accessible label. |
| `DialogContent.description` | `string` | — | Supporting copy. |
| `DialogContent.className` | `string` | — | Content-container class name. |

## Events

| Event | Type | Description |
|------|------|------|
| `Dialog.onOpenChange` | `(open: boolean) => void` | Called when the open state changes; forwarded to Base UI Dialog Root. |

## Slots

| Slot | Type | Description |
|------|------|------|
| `DialogContent.footer` | `ReactNode` | Action area below the body with a top divider and right alignment, matching DrawerContent. |
| `DialogContent.children` | `ReactNode` | Main body content. |

## Example
```tsx
<Dialog>
  <DialogTrigger render={<Button variant="outline">Open dialog</Button>} />
  <DialogContent title="Hulian dialog" description="Focus stays inside, Escape closes, and focus returns to the trigger.">
    <div className="flex justify-end gap-2">
      <DialogClose render={<Button variant="ghost">Cancel</Button>} />
      <DialogClose render={<Button>Confirm</Button>} />
    </div>
  </DialogContent>
</Dialog>
```

## Usage guidelines

- Use `render={<Button … />}` on DialogTrigger and DialogClose to merge behavior into the target element. Do not wrap another button around them; that creates nested interactive elements and duplicate click handling.
- Prefer the `footer` slot for actions so it receives the divider and alignment, leaving `children` for primary content.

## Related
[Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
