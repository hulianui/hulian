---
slug: drawer
name: Drawer
category: feedback
group: overlay
tags: []
exports: [Drawer, DrawerTrigger, DrawerClose, DrawerContent, drawerVariants]
status: enriched
---

# Drawer

> Drawer · Base UI Dialog engine with four slide-in directions · feedback/overlay

## When to use

Use Drawer for a panel that slides from a screen edge, such as filters, details, a form, or mobile navigation. Its body scrolls independently while actions remain pinned. Use [Dialog](../dialog/dialog.md) for a centered overlay, [AlertDialog](../alert-dialog/alert-dialog.md) for a forced decision, or [Popover](../popover/popover.md) for a small anchored surface.

## Import
```ts
import { Drawer, DrawerTrigger, DrawerClose, DrawerContent, drawerVariants } from "@hulianui/ui"
```

## Props

`Drawer` forwards Base UI Dialog Root props such as `open`, `defaultOpen`, and `onOpenChange`. DrawerTrigger and DrawerClose support `render`. `DrawerContent` adds HulianUI styling:

| Name | Type | Default | Description |
|------|------|------|------|
| `DrawerContent.side` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | Attached edge and corresponding slide direction. |
| `DrawerContent.container` | `Element \| Ref` | — | Local portal target. The drawer uses absolute positioning inside it; the target needs `position:relative` and `overflow-hidden`. Useful for phone-frame previews. |
| `DrawerContent.showClose` | `boolean` | `true` | Whether to render the built-in top-right close button. |
| `DrawerContent.closeLabel` | `string` | Locale value | Accessible name for the built-in close button; defaults to `locale.drawer.close`. |
| `DrawerContent.descriptionClassName` | `string` | — | Appended to the description (merged with twMerge). Pass `sr-only` for a screen-reader-only description. |
| `DrawerContent.backdrop` | `boolean` | `true` | Whether to render the backdrop. Setting it to `false` together with `modal={false}` on the root is what makes an overlay truly non-modal; turning off only one is not enough, because the `inset-0` backdrop swallows every click even when it is transparent. |
| `DrawerContent.backdropClassName` | `string` | — | Appended to the backdrop, whose default is `bg-black/40 backdrop-blur-sm`. Classes merge with twMerge. |
| `DrawerContent.scrollable` | `boolean` | `true` | Whether the body scrolls itself. When `false`, the body becomes a column flex container that passes a definite height to its children. |
| `DrawerContent.bodyClassName` | `string` | — | Appended to the body container. |
| `DrawerContent.className` | `string` | — | Content-container class name. |

## Events

| Event | Type | Description |
|------|------|------|
| `Drawer.onOpenChange` | `(open: boolean) => void` | Called when the open state changes; forwarded to Base UI Dialog Root. |

## Slots

| Slot | Type | Description |
|------|------|------|
| `DrawerContent.title` | `ReactNode` | Optional Dialog.Title and accessible label. |
| `DrawerContent.description` | `ReactNode` | Supporting copy. |
| `DrawerContent.footer` | `ReactNode` | Pinned action area with a divider, kept visible while the body scrolls. |
| `DrawerContent.children` | `ReactNode` | Main body content. |

## Example
```tsx
<Drawer>
  <DrawerTrigger render={<Button variant="outline">Open drawer</Button>} />
  <DrawerContent
    side="right"
    title="Settings"
    description="Escape, the overlay, or a close control dismisses the drawer; focus remains inside."
    footer={<><DrawerClose render={<Button variant="outline">Cancel</Button>} /><DrawerClose render={<Button>Save</Button>} /></>}
  >
    {/* Long body content scrolls while the footer remains pinned */}
  </DrawerContent>
</Drawer>
```

## Usage guidelines

- A non-modal overlay takes **two changes**: `modal={false}` on the root, which releases the focus and scroll locks, plus `backdrop={false}` on the content, which stops rendering the backdrop. Changing only the first leaves a `fixed inset-0` layer that swallows every click even while transparent, so nothing actually becomes non-modal.
- With `scrollable={false}`, **vertical scrolling becomes your responsibility**: the body only passes a definite height down as a column flex container, and each child needs its own `overflow-y-auto`. Forgetting that clips the content at `max-h`.

- Base UI rc.0 has no standalone Drawer primitive. This component restyles Dialog's Portal, Backdrop, and Popup and uses `translateX/Y` by side. Dialog has no Positioner, so Tooltip and Popover positioning assumptions do not apply. See [[base-ui-dialog-drawer-side-slide-via-transform]].
- Put Cancel, Save, and Close controls in `footer`; actions at the end of the body scroll out of view.
- With `container`, the target must use `position:relative` and `overflow-hidden` or the drawer and overlay escape the local frame.

### Close button

`DrawerContent` renders a top-right close button by default through `showClose`. Its accessible name comes from `closeLabel` or the locale's `drawer.close` value. Display-only drawers such as navigation or detail panels may have no footer; previously their only visible escape was the overlay, keyboard users had only Escape, and screen-reader users could not discover a Close control inside the panel (hulianui/hulian#63). The button is absolutely positioned and does not consume layout space.

## Related
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
