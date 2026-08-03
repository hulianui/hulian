---
slug: glimpse
name: Glimpse
category: feedback
group: overlay
tags: []
exports: [Glimpse]
status: enriched
---

# Glimpse

> Link preview · HoverCard restyled as a cover, title, description, and domain preview; renders an external anchor with `href` or an inline span without it · feedback/overlay

## When to use

Use Glimpse to show a Wikipedia-style cover, title, description, and domain preview when readers hover a link or term without interrupting the article. Use [HoverCard](../hover-card/hover-card.md) for completely custom content or [Tooltip](../tooltip/tooltip.md) for short text. With `href`, the trigger is an external link opened in a new tab and the card shows its domain; without it, the trigger remains an inline `span`.

## Import
```ts
import { Glimpse } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| image | `string` | — | Cover image URL. |
| href | `string` | — | Destination. When present, renders an external-link trigger and shows the domain. |
| side | `"top"\|"right"\|"bottom"\|"left"` | `"bottom"` | Preferred popup side. |
| align | `"start"\|"center"\|"end"` | `"center"` | Alignment along the trigger. |
| openDelay | `number` | `300` | Opening delay in milliseconds. |
| closeDelay | `number` | `150` | Closing delay in milliseconds. |
| className | `string` | — | Trigger class name. |
| contentClassName | `string` | — | Preview-card class name. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Inline trigger text or term. |
| title | `ReactNode` | Preview title. |
| description | `ReactNode` | Multiline-clamped preview description. |

## Example
```tsx
<p className="max-w-md leading-7 text-foreground">
  Our design system is built with{" "}
  <Glimpse href="https://hulian.example.com/tokens" image={cover} title="Hulian design tokens" description="Semantic color, spacing, and radius variables with light and dark themes out of the box.">
    semantic tokens
  </Glimpse>{" "}
  that can be previewed on hover.
</p>
```

## Usage guidelines

- Documentation gates prohibit remote images. In showcases and demos, use a local asset or SVG data URI for `image`.
- Without `href`, the trigger is a non-navigating `span` suited to definitions. Provide `href` when it must navigate.
- Hover protection follows HoverCard's `openDelay` and `closeDelay`; do not set both to zero.

## Related
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md)
