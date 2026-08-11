---
slug: popover
name: Popover
category: feedback
group: overlay
tags: []
exports: [Popover, PopoverTrigger, PopoverClose, PopoverContent]
status: enriched
---

# Popover

> Popover card · Click trigger with title, description, and Close primitive · feedback/overlay

## When to use

Use Popover for a lightweight click-triggered surface containing a title, description, a few actions, or a compact form. It closes on outside interaction or Escape. Use [Tooltip](../tooltip/tooltip.md) for short hover text, [HoverCard](../hover-card/hover-card.md) for rich hover content, or [Dialog](../dialog/dialog.md) for a modal flow with an overlay and focus trap.

## Import
```ts
import { Popover, PopoverTrigger, PopoverClose, PopoverContent } from "@hulianui/ui"
```

## Props

`PopoverContent`:

| Name | Type | Default | Description |
|------|------|------|------|
| side | `"top"\|"right"\|"bottom"\|"left"` | `"bottom"` | Preferred popup side. |
| align | `"start"\|"center"\|"end"` | `"center"` | Alignment along the trigger. |
| sideOffset | `number` | `8` | Distance from the trigger in pixels. |
| plain | `boolean` | `false` | No chrome: skip the wrapper around children (spacing plus `text-sm text-foreground`) so children land directly in the popup. |
| arrow | `boolean` | `true` | Whether to render the arrow pointing at the trigger. |
| className | `string` | — | Additional class name. |

### plain and arrow: edge-to-edge popups whose content brings its own appearance

`PopoverContent` wraps children in a `text-sm text-foreground` skin element, and adds `mt-2` to separate it from the header **only when a title or description is present**. When the popup holds one whole block that brings its own appearance and needs to reach the edges — a search row above a tag list, a `Calendar` panel, or a popup used as a flush menu — pair `className="p-0"` with `plain`:

```tsx
<PopoverContent plain arrow={false} align="start" className="w-auto p-0">
  <div className="flex items-center gap-2 border-b border-border p-2">
    <Search className="size-3" />
    <Input variant="cell" placeholder="Search tags" />
  </div>
  <div className="py-1">{/* Tag list */}</div>
</PopoverContent>
```

`p-0` clears only the popup's own padding, never the inner skin element: `className` lands on the popup and cannot reach inside, so do not reach in with arbitrary variants such as `[&>div]:mt-0`, which turns internal structure into an external contract.

`arrow` and `plain` are **two independent switches**, because the arrow describes the relationship between popup and trigger rather than the appearance of the content. A flush menu usually turns both off, while a plain text hint without a title needs only `plain`, and a full-bleed panel that should still point at its source keeps the arrow.

The same `plain` name means the same thing as [Card](../card/card.md)'s `variant="plain"` and the panel `plain` on [Accordion](../accordion/accordion.md) and [Collapsible](../collapsible/collapsible.md): **when the content brings its own appearance, the answer is no skin rather than a different skin**.

## Slots

`PopoverContent`:

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Title. |
| description | `ReactNode` | Supporting copy. |
| children | `ReactNode` | Body and actions. |

`PopoverTrigger` and `PopoverClose` use `render` to supply custom trigger or close elements, for example `render={<Button>…</Button>}`.

## Example
```tsx
<Popover>
  <PopoverTrigger render={<Button>Open popover</Button>} />
  <PopoverContent side="bottom" align="center" title="Confirm action" description="Click outside or press Escape to close.">
    <div className="flex justify-end gap-2">
      <PopoverClose render={<Button variant="ghost">Cancel</Button>} />
      <PopoverClose render={<Button>Confirm</Button>} />
    </div>
  </PopoverContent>
</Popover>
```

## Usage guidelines

- Inject trigger and close elements through `render`. Do not nest another interactive element inside PopoverTrigger, which can create `<button>` inside `<button>`.
- Add `plain` (usually with `className="p-0"`) when the popup content brings its own padding, borders, or body color. Do not reach into the internal skin element with arbitrary variants such as `[&>div]:mt-0`.
- Combining hover opening with focus closing on a focus-managing popover can flicker: opening moves focus inside, blur closes it, and restored focus reopens it. See [[hovercard-on-focus-managing-popover-flickers-set-initial-final-focus-false]]. If adapting this component to hover behavior, set `initialFocus` and `finalFocus` to false.

## Related
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
