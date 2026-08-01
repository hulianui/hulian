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
| side | `"top"｜"right"｜"bottom"｜"left"` | `"bottom"` | Preferred popup side. |
| align | `"start"｜"center"｜"end"` | `"center"` | Alignment along the trigger. |
| sideOffset | `number` | — | Distance from the trigger. |
| className | `string` | — | Additional class name. |

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
- Combining hover opening with focus closing on a focus-managing popover can flicker: opening moves focus inside, blur closes it, and restored focus reopens it. See [[hovercard-on-focus-managing-popover-flickers-set-initial-final-focus-false]]. If adapting this component to hover behavior, set `initialFocus` and `finalFocus` to false.

## Related
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
