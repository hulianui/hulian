---
slug: toolbar
name: Toolbar
category: navigation
group: action
tags: []
exports: [Toolbar, ToolbarButton, ToolbarToggle, ToolbarGroup, ToolbarSeparator]
status: enriched
---

# Toolbar

> Toolbar · Base UI `role=toolbar` with arrow-key navigation, buttons, groups, toggles, and separators · navigation/action

## When to use

Use Toolbar for a persistent horizontal or vertical set of related controls such as rich-text formatting, alignment, and sharing. It provides `role=toolbar` and arrow-key focus movement. Use [ContextMenu](../context-menu/context-menu.md) for actions opened on demand or [Command](../command/command.md) for a Command/Ctrl+K searchable palette.

## Import
```ts
import { Toolbar, ToolbarButton, ToolbarToggle, ToolbarGroup, ToolbarSeparator } from "@hulianui/ui"
```

## Props

**Toolbar**

| Name | Type | Default | Description |
|------|------|------|------|
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | Layout direction. |
| disabled | `boolean` | — | Whether the entire toolbar is disabled. |
| loopFocus | `boolean` | `true` | Whether keyboard navigation wraps after the final control. |
| aria-label | `string` | — | Accessible toolbar label. |
| className | `string` | — | Additional class name. |

**ToolbarButton**

| Name | Type | Default | Description |
|------|------|------|------|
| disabled | `boolean` | — | Whether the button is disabled. |
| aria-label | `string` | — | Accessible label, required for an icon-only button. |
| className | `string` | — | Additional class name. |

**ToolbarToggle**

| Name | Type | Default | Description |
|------|------|------|------|
| pressed | `boolean` | — | Controlled pressed state. |
| defaultPressed | `boolean` | `false` | Initial pressed state when uncontrolled. |
| disabled | `boolean` | — | Whether the toggle is disabled. |
| aria-label | `string` | — | Accessible label. |
| className | `string` | — | Additional class name. |

**ToolbarGroup**: props `disabled` / `aria-label` / `className`; slot `children`.
**ToolbarSeparator**: props `orientation?: "horizontal" \| "vertical"` / `className`.

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | `ToolbarButton` click handler. |
| onPressedChange | `(pressed: boolean) => void` | Called when `ToolbarToggle` changes state. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Child content of `Toolbar`, `ToolbarButton`, `ToolbarToggle`, or `ToolbarGroup`. |

## Example
```tsx
<Toolbar aria-label="Text formatting">
  <ToolbarGroup>
    <ToolbarToggle aria-label="Bold" defaultPressed><Bold className="size-4" /></ToolbarToggle>
    <ToolbarToggle aria-label="Italic"><Italic className="size-4" /></ToolbarToggle>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarButton aria-label="Share"><Share2 className="size-4" />Share</ToolbarButton>
</Toolbar>
```

## Usage guidelines

- Add `aria-label` to icon-only `ToolbarButton` and `ToolbarToggle` controls so screen readers can identify them.
- Choose either controlled `pressed` or uncontrolled `defaultPressed` for each ToolbarToggle. Mixing both can desynchronize state.

## Related
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Accordion](../accordion/accordion.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
