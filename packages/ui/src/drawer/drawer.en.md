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

- Base UI rc.0 has no standalone Drawer primitive. This component restyles Dialog's Portal, Backdrop, and Popup and uses `translateX/Y` by side. Dialog has no Positioner, so Tooltip and Popover positioning assumptions do not apply. See [[base-ui-dialog-drawer-side-slide-via-transform]].
- Put Cancel, Save, and Close controls in `footer`; actions at the end of the body scroll out of view.
- With `container`, the target must use `position:relative` and `overflow-hidden` or the drawer and overlay escape the local frame.

## Related
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
