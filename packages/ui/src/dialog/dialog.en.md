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
| `DialogContent.title` * | `ReactNode` | — | Visible title and accessible label. Accepts a node, so an icon plus text works. |
| `DialogContent.description` | `ReactNode` | — | Supporting copy. Rendered inside a `<p>`, so **phrasing content only** — put block-level content in children. |
| `DialogContent.descriptionClassName` | `string` | — | Appended to the description (merged with twMerge). Pass `sr-only` for a screen-reader-only description, which keeps the visible header to the title alone while assistive technology still reads the sentence. |
| `DialogContent.backdrop` | `boolean` | `true` | Whether to render the backdrop. Setting it to `false` together with `modal={false}` on the root is what makes an overlay truly non-modal; turning off only one is not enough, because the `inset-0` backdrop swallows every click even when it is transparent. |
| `DialogContent.backdropClassName` | `string` | — | Appended to the backdrop, whose default is `bg-black/40 backdrop-blur-sm`. Classes merge with twMerge, so dimming and blur can follow your design system. |
| `DialogContent.scrollable` | `boolean` | `true` | Whether the body scrolls itself. When `false`, the body becomes a column flex container that passes a definite height to its children, so a two-pane layout only needs `flex-1 min-h-0` instead of a hand-tuned `h-[58vh]`. |
| `DialogContent.bodyClassName` | `string` | — | Appended to the body container. |
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

- A non-modal overlay takes **two changes**: `modal={false}` on the root, which releases the focus and scroll locks, plus `backdrop={false}` on the content, which stops rendering the backdrop. Changing only the first leaves a `fixed inset-0` layer that swallows every click even while transparent, so nothing actually becomes non-modal.
- With `scrollable={false}`, **vertical scrolling becomes your responsibility**: the body only passes a definite height down as a column flex container, and each child needs its own `overflow-y-auto`. Forgetting that clips the content at `max-h`.

- Use `render={<Button … />}` on DialogTrigger and DialogClose to merge behavior into the target element. Do not wrap another button around them; that creates nested interactive elements and duplicate click handling.
- Prefer the `footer` slot for actions so it receives the divider and alignment, leaving `children` for primary content.

## Related
[Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
