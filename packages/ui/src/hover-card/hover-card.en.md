---
slug: hover-card
name: HoverCard
category: feedback
group: overlay
tags: []
exports: [HoverCard, HoverCardTrigger, HoverCardContent]
status: enriched
---

# HoverCard

> Hover card · Popover-based hover opening and delayed closing, following the Tooltip delay model, with rich content · feedback/overlay

## When to use

Use HoverCard for rich content revealed on hover, such as a profile card, term definition, or link preview. Open and close delays reduce accidental activation. Use [Tooltip](../tooltip/tooltip.md) for short plain text, [Popover](../popover/popover.md) for click-triggered actions, or [Glimpse](../glimpse/glimpse.md) for a standard cover/title/domain link preview.

## Import
```ts
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@hulianui/ui"
```

## Props

`HoverCard`:

| Name | Type | Default | Description |
|------|------|------|------|
| openDelay | `number` | `300` | Hover duration in milliseconds before opening. |
| closeDelay | `number` | `150` | Delay in milliseconds before closing after pointer exit. |

`HoverCardContent`:

| Name | Type | Default | Description |
|------|------|------|------|
| side | `"top"\|"right"\|"bottom"\|"left"` | `"bottom"` | Preferred popup side. |
| align | `"start"\|"center"\|"end"` | `"center"` | Alignment along the trigger. |
| sideOffset | `number` | `8` | Distance from the trigger in pixels. |
| anchor | `Element\|RefObject<Element>\|VirtualElement\|(() => Element\|VirtualElement\|null)` | — | Position the card against something other than the trigger, with the same contract as [Popover](../popover/popover.md)'s `anchor`. One difference: **the trigger stays mandatory**, because the card opens on hover, so `anchor` only changes where it sits, not what opens it. |
| className | `string` | — | Additional class name. |

## Slots

| Slot | Type | Description |
|------|------|------|
| `HoverCard` children | `ReactNode` | Trigger and Content composition. |
| `HoverCardContent` children | `ReactNode` | Rich card content. |

Use `render` on HoverCardTrigger to supply an inline link or button.

## Example
```tsx
<HoverCard>
  <HoverCardTrigger render={<button type="button" className="font-medium text-primary underline">@Hulian design system</button>} />
  <HoverCardContent side="bottom" align="center">
    <div className="flex gap-3">
      <div className="flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">H</div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">Hulian design system</p>
        <p className="text-xs text-muted-foreground">Opens on hover · closes after a delay</p>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

## Usage guidelines

- The component disables managed initial and final focus as described in [[hovercard-on-focus-managing-popover-flickers-set-initial-final-focus-false]]. This prevents hover and focus from repeatedly opening and closing a focus-managing popover. Preserve that behavior in forks.
- Tune accidental activation with `openDelay` and `closeDelay`. A zero close delay can flash closed while the pointer crosses the gap from trigger to card.
- `HoverCardContent` extends the native div attributes, so `data-testid`, `role`, `aria-*`, and `onClick` all attach directly. The card is portaled out, but synthetic events still bubble along the **React tree** back to the parent that holds the trigger — inside a fully clickable row or card, add `onClick={(e) => e.stopPropagation()}` or clicking the card content also fires the row `onClick`. A forwarded `onMouseEnter` or `onMouseLeave` is **merged** with the internal timers rather than replacing them, so it cannot accidentally close the card.

## Related
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md)
