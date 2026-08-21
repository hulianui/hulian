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

> Slides contextual or task content from any screen edge with modal focus management and a localized optional close button. · feedback/overlay

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
| `DrawerContent.size` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"md"` | Main-axis size step. **The main axis follows `side`**: left and right drawers take a width, top and bottom drawers take a height, so one step is not the same value on both axes (see the table below). The cross axis is always 100% and does not follow this step. |
| `DrawerContent.container` | `Element \| Ref` | - | Local portal target. The drawer uses absolute positioning inside it; the target needs `position:relative` and `overflow-hidden`. Useful for phone-frame previews. |
| `DrawerContent.showClose` | `boolean` | `true` | Whether to render the built-in top-right close button. |
| `DrawerContent.closeLabel` | `string` | Locale value | Accessible name for the built-in close button; defaults to `locale.drawer.close`. |
| `DrawerContent.aria-label` | `string` | - | Accessible name for the drawer, applied directly to the popup. **The only way to name a drawer that has no `title`**. Use it when the visible header is drawn by the consumer (see "Naming a drawer with a custom header"). |
| `DrawerContent.aria-labelledby` | `string` | - | Id of the element that names the drawer. Use it to point at an existing visible heading; it wins over the id generated from `title`. Supply either this or `aria-label`. |
| `DrawerContent.titleClassName` | `string` | - | Appended to the title (defaults to `text-lg font-semibold`), merged with twMerge. |
| `DrawerContent.descriptionClassName` | `string` | - | Appended to the description (merged with twMerge). Pass `sr-only` for a screen-reader-only description. |
| `DrawerContent.backdrop` | `boolean` | `true` | Whether to render the backdrop. Setting it to `false` together with `modal={false}` on the root is what makes an overlay truly non-modal; turning off only one is not enough, because the `inset-0` backdrop swallows every click even when it is transparent. |
| `DrawerContent.backdropClassName` | `string` | - | Appended to the backdrop, whose default is `bg-black/40 backdrop-blur-sm`. Classes merge with twMerge. |
| `DrawerContent.scrollable` | `boolean` | `true` | Whether the body scrolls itself. When `false`, the body becomes a column flex container that passes a definite height to its children. |
| `DrawerContent.bodyClassName` | `string` | - | Appended to the body container. |
| `DrawerContent.className` | `string` | - | Content-container class name. |

### Size steps

| size | `left` / `right` width | `top` / `bottom` height |
|------|------|------|
| `sm` | 20rem (320px) | 16rem (256px) |
| `md` (default) | 24rem (384px) | 20rem (320px) |
| `lg` | 32rem (512px) | 32rem (512px) |
| `xl` | 48rem (768px) | 48rem (768px) |
| `full` | 100% | 100% |

Every step except `full` carries a `min(90vw, …)` or `min(90vh, …)` cap. A drawer is edge-anchored, so any width beyond the viewport falls off-screen entirely rather than merely feeling cramped. `md` reproduces the values that were hard-coded through 0.39.0, so code that does not pass `size` renders exactly as before.

## Events

| Event | Type | Description |
|------|------|------|
| `Drawer.onOpenChange` | `(open: boolean) => void` | Called when the open state changes; forwarded to Base UI Dialog Root. |

## Slots

| Slot | Type | Description |
|------|------|------|
| `DrawerContent.title` | `ReactNode` | Optional Dialog.Title and accessible label. The host element is an `<h2>` and **accepts phrasing content only** (text, `<span>`, icons); put button rows in `extra`. |
| `DrawerContent.extra` | `ReactNode` | Actions to the right of the title (buttons, badges, counts). Shares the title row, right-aligned, and **never contributes to the accessible name**. Makes room for the built-in close button automatically. |
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

### Choosing `size` over `className`

Reach for `size` first. Overriding `w-` or `h-` through `className` also works, but it forces you to override `inset-x-` and `w-full` alongside them, undoing what the component just set, and it drops the `min(90vw, …)` cap. On a narrow viewport the drawer then grows wider than the screen, and because a drawer is edge-anchored, the overflowing part is off-screen and its controls are unreachable. When the five steps genuinely do not fit, for example when you need a percentage of a container, use `className` and **restore a cap yourself**, such as `className="w-[min(90vw,52rem)]"`.

### Floating bottom sheets need manual work

The component ships only the edge-anchored form. The floating mobile sheet, inset from the screen edges with rounded corners, has to come from `className`, and you **must change the exit transform as well**: once the panel sits 16px above the bottom edge, the original `translate-y-full` no longer carries it off-screen, so a 16px sliver stays visible while it closes.

```tsx
<DrawerContent
  side="bottom"
  size="lg"
  className="inset-x-4 bottom-4 w-auto rounded-[var(--radius)] border
             data-[starting-style]:translate-y-[calc(100%+1rem)]
             data-[ending-style]:translate-y-[calc(100%+1rem)]"
/>
```

### Naming a drawer with a custom header

A drawer is a modal surface and **must have a name**. Base UI derives `aria-labelledby` from `Dialog.Title` only: with no title it is `undefined` and falls back to nothing, so screen-reader users get an unnamed dialog. Supplying none of `title` / `aria-label` / `aria-labelledby` logs a development warning.

Do not push a row of controls into `title`. `Dialog.Title` renders an `<h2>`, which accepts phrasing content only, so a `<div>` inside it is invalid nesting, and because `aria-labelledby` points at the whole `<h2>`, the name would become "Notifications 2 unread Mark all read", reading the buttons out loud as part of the name. Pick by header complexity:

```tsx
// 1) Title plus a few actions: use extra; the component lays out the row and yields the top-right corner
<DrawerContent
  title="Notifications"
  extra={
    <>
      <Tag>2 unread</Tag>
      <Button variant="ghost" size="sm">Mark all read</Button>
    </>
  }
>
  {/* list */}
</DrawerContent>

// 2) Edge-to-edge: the header owns its own divider, padding, and env() safe area, so draw it yourself
//    and name the drawer with aria-label (no sr-only placeholder title needed)
<DrawerContent
  aria-label="Notifications"
  showClose={false}
  scrollable={false}
  className="gap-0 p-0 [--hl-overlay-pad:0px]"
>
  <div className="flex items-center justify-between border-b px-4 py-3">…</div>
  <ScrollArea className="min-h-0 flex-1">{/* list */}</ScrollArea>
</DrawerContent>

// 3) A visible heading already exists on the page: point at it
<DrawerContent aria-labelledby="panel-heading">…</DrawerContent>
```

`aria-label` wins when both it and `title` are supplied, but that usually means the two strings disagree, so treat it as a bug to fix, not a feature.

### Close button

`DrawerContent` renders a top-right close button by default through `showClose`. Its accessible name comes from `closeLabel` or the locale's `drawer.close` value. Display-only drawers such as navigation or detail panels may have no footer; previously their only visible escape was the overlay, keyboard users had only Escape, and screen-reader users could not discover a Close control inside the panel (hulianui/hulian#63). The button is absolutely positioned and does not consume layout space.

## Related
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
