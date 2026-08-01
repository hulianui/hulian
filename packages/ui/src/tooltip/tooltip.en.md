---
slug: tooltip
name: Tooltip
category: feedback
group: overlay
tags: []
exports: [Tooltip, TooltipTrigger, TooltipProvider, TooltipContent]
status: enriched
---

# Tooltip

> Tooltip · Base UI Positioner and arrow with hover and focus triggers · feedback/overlay

## When to use

Use Tooltip for short plain-text explanations on hover or focus, such as an icon's meaning, full truncated text, or action guidance. Use [HoverCard](../hover-card/hover-card.md) for rich content or [Popover](../popover/popover.md) for click-triggered content with actions. Configure `delay` and `closeDelay` on `TooltipProvider`, not Tooltip.

## Import
```ts
import { Tooltip, TooltipTrigger, TooltipProvider, TooltipContent } from "@hulianui/ui"
```

## Props

`TooltipContent`:

| Name | Type | Default | Description |
|------|------|------|------|
| side | `"top"｜"right"｜"bottom"｜"left"` | `"top"` | Preferred popup side. |
| align | `"start"｜"center"｜"end"` | `"center"` | Alignment along the trigger. |
| sideOffset | `number` | `8` | Distance from the trigger in pixels. |
| className | `string` | — | Additional class name. |

`TooltipProvider` accepts `delay` and `closeDelay` in milliseconds.

## Slots

`TooltipContent`:

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Tooltip copy. |

Use `render` on TooltipTrigger to provide the trigger. **This is required for interactive elements such as buttons, links, and inputs; do not pass them as children.**

## Example
```tsx
<TooltipProvider delay={0} closeDelay={0}>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline">Hover for details</Button>} />
    <TooltipContent side="top" align="center">Hulian tooltip</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## Usage guidelines

- **Inject the trigger with `render`, rather than passing it as children.** TooltipTrigger otherwise renders its own `<button>` and places children inside it. A button child becomes invalid `button > button`, which TypeScript and builds do not catch but exposes two controls to assistive technology. Use `<TooltipTrigger render={<button aria-label="Settings" onClick={onOpen}>⚓</button>} />`; Base UI merges its handlers with yours.

  ```tsx
  // Incorrect: creates button > button
  <TooltipTrigger>
    <button aria-label="Settings" onClick={onOpen}>Anchor</button>
  </TooltipTrigger>

  // Correct: Base UI merges handlers into this element
  <TooltipTrigger render={<button aria-label="Settings" onClick={onOpen}>Anchor</button>} />
  ```
- **TooltipContent's popup has no `role="tooltip"`.** In E2E and acceptance tests, locate it by text or class rather than `[role="tooltip"]`.
- Put `delay` and `closeDelay` on TooltipProvider. Set both to zero for deterministic screenshots and hover checks.
- In a flex row with ellipsis and `min-w-0`, an `inline-block` wrapper can expand to intrinsic width and defeat truncation. When using `render`, keep the trigger itself `block` and `min-w-0`; see [[heroui-tooltip-trigger-inline-block-breaks-flex-truncation]].

## Related
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [HoverCard](../hover-card/hover-card.md)
