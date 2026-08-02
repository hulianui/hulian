---
slug: context-menu
name: ContextMenu
category: navigation
group: action
tags: []
exports: [ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuGroup, ContextMenuGroupLabel, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent]
status: enriched
---

# ContextMenu

> Context menu · Thin Base UI context-menu wrapper anchored to the pointer, reusing Menu styling, `data-highlighted`, submenus, and a danger variant · navigation/action

## When to use

Use ContextMenu to open pointer-anchored actions from a right click or long press within a target region, including Edit, Copy, Delete, nested submenus, and groups. Use [Command](../command/command.md) for a global searchable command entry or [Toolbar](../toolbar/toolbar.md) for persistent controls. ContextMenu reuses Menu styling and supports `variant="danger"` for destructive items.

## Import
```ts
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuGroup, ContextMenuGroupLabel, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from "@hulianui/ui"
```

## Props

**ContextMenuItem**

| Name | Type | Default | Description |
|------|------|------|------|
| disabled | `boolean` | — | Whether the item is unavailable. |
| closeOnClick | `boolean` | `true` | Whether selecting the item closes the menu. |
| label | `string` | — | Text override for keyboard type-ahead, needed when children are not plain text. |
| variant | `"default" \| "danger"` | `"default"` | Visual treatment; use danger for destructive actions. |
| className | `string` | — | Additional class name. |

**ContextMenuSubTrigger**: props `disabled` / `label` / `variant?: "default" \| "danger"` / `className`; slot `children`.
**ContextMenuContent / ContextMenuSubContent**: prop `className`; slot `children`.
**ContextMenuTrigger / Group / GroupLabel / Separator / Sub**: structural wrappers around the corresponding Base UI primitives, forwarding `children` and `className`.

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `MouseEventHandler<HTMLElement>` | `ContextMenuItem` click handler. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Content of a `ContextMenuItem`. |

## Example
```tsx
<ContextMenu>
  <ContextMenuTrigger className="flex h-28 items-center justify-center border border-dashed">
    Right-click this area
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem>Edit</ContextMenuItem>
    <ContextMenuItem disabled>Archive (unavailable)</ContextMenuItem>
    <ContextMenuSub>
      <ContextMenuSubTrigger>Move to</ContextMenuSubTrigger>
      <ContextMenuSubContent>
        <ContextMenuItem>Project A</ContextMenuItem>
        <ContextMenuItem>Project B</ContextMenuItem>
      </ContextMenuSubContent>
    </ContextMenuSub>
    <ContextMenuSeparator />
    <ContextMenuItem variant="danger">Delete</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

## Usage guidelines

- Wrap grouped entries in `ContextMenuGroup` and label them with `ContextMenuGroupLabel` for correct group semantics. Bare items form one unlabelled list.
- When `ContextMenuItem` children contain rich content such as an icon, add `label` for keyboard type-ahead.

## Related
[Command](../command/command.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
