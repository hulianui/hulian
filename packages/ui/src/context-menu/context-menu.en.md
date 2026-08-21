---
slug: context-menu
name: ContextMenu
category: navigation
group: action
tags: []
exports: [ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuGroup, ContextMenuGroupLabel, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent]
status: enriched
---

# ContextMenu

> Opens contextual action items at the pointer with a danger treatment. · navigation/action

## When to use

Use ContextMenu to open pointer-anchored actions from a right click or long press within a target region, including Edit, Copy, Delete, nested submenus, and groups. Use [Command](../command/command.md) for a global searchable command entry or [Toolbar](../toolbar/toolbar.md) for persistent controls. ContextMenu reuses Menu styling and supports `variant="danger"` for destructive items.

## Import
```ts
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuGroup, ContextMenuGroupLabel, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from "@hulianui/ui"
```

## Props

**ContextMenuItem**

| Name | Type | Default | Description |
|------|------|------|------|
| disabled | `boolean` | - | Whether the item is unavailable. |
| closeOnClick | `boolean` | `true` | Whether selecting the item closes the menu. |
| label | `string` | - | Text override for keyboard type-ahead, needed when children are not plain text. |
| variant | `"default" \| "danger"` | `"default"` | Visual treatment; use danger for destructive actions. |
| className | `string` | - | Additional class name. |

**ContextMenuCheckboxItem**: a setting that can be toggled on or off. Renders `role="menuitemcheckbox"` plus `aria-checked`.

| Name | Type | Default | Description |
|------|------|------|------|
| checked | `boolean` | - | Whether the item is ticked (controlled). For an uncontrolled item use `defaultChecked` instead. |
| defaultChecked | `boolean` | `false` | Whether the item is initially ticked (uncontrolled). |
| disabled | `boolean` | `false` | Whether the item is unavailable. |
| closeOnClick | `boolean` | `false` | Whether selecting the item closes the menu. Checkbox items keep the menu open by default so several can be toggled in a row. |
| label | `string` | - | Text override for keyboard type-ahead. |
| variant | `"default" \| "danger"` | `"default"` | Visual treatment; use danger for destructive actions. |
| className | `string` | - | Additional class name. |

**ContextMenuRadioGroup**: container for a set of mutually exclusive options. Every `ContextMenuRadioItem` must be nested inside one.

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string` | - | Value of the currently selected item (controlled). For an uncontrolled group use `defaultValue` instead. |
| defaultValue | `string` | - | Value of the initially selected item (uncontrolled). |
| disabled | `boolean` | `false` | Whether the whole group is unavailable. |
| className | `string` | - | Additional class name. |

**ContextMenuRadioItem**: one option in a mutually exclusive set. Renders `role="menuitemradio"` plus `aria-checked`.

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `string` | - | Value of this item; it is selected when it equals the value of its `ContextMenuRadioGroup`. |
| disabled | `boolean` | `false` | Whether the item is unavailable. |
| closeOnClick | `boolean` | `false` | Whether selecting the item closes the menu. Radio items keep the menu open by default, so pass `true` if picking a value should dismiss it. |
| label | `string` | - | Text override for keyboard type-ahead. |
| variant | `"default" \| "danger"` | `"default"` | Visual treatment; use danger for destructive actions. |
| className | `string` | - | Additional class name. |

**ContextMenuSubTrigger**: props `disabled` / `label` / `variant?: "default" \| "danger"` / `className`; slot `children`.
**ContextMenuContent / ContextMenuSubContent**: prop `className`; slot `children`.
**ContextMenuTrigger / Group / GroupLabel / Separator / Sub**: structural wrappers around the corresponding Base UI primitives, forwarding `children` and `className`.

## Events

| Event | Type | Description |
|------|------|------|
| onClick | `MouseEventHandler<HTMLElement>` | Click handler for `ContextMenuItem`, `ContextMenuCheckboxItem`, and `ContextMenuRadioItem`. |
| onCheckedChange | `(checked: boolean) => void` | Called when a `ContextMenuCheckboxItem` is ticked or unticked. |
| onValueChange | `(value: string) => void` | Called when the value of a `ContextMenuRadioGroup` changes. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Content of a `ContextMenuItem`; for `ContextMenuCheckboxItem` and `ContextMenuRadioItem` it renders in the second column, to the right of the selection marker; a `ContextMenuRadioGroup` holds a set of `ContextMenuRadioItem` elements. |

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

Checkbox and radio items, the usual shape of a task-card context menu:
```tsx
<ContextMenuContent>
  <ContextMenuCheckboxItem defaultChecked>Pin this task</ContextMenuCheckboxItem>
  <ContextMenuSeparator />
  <ContextMenuGroup>
    <ContextMenuGroupLabel>Priority</ContextMenuGroupLabel>
    <ContextMenuRadioGroup value={priority} onValueChange={setPriority}>
      <ContextMenuRadioItem value="low" closeOnClick>Low</ContextMenuRadioItem>
      <ContextMenuRadioItem value="medium" closeOnClick>Medium</ContextMenuRadioItem>
      <ContextMenuRadioItem value="high" closeOnClick>High</ContextMenuRadioItem>
    </ContextMenuRadioGroup>
  </ContextMenuGroup>
</ContextMenuContent>
```
(`closeOnClick` dismisses the menu once a value is picked; it defaults to `false`, which keeps the menu open for further edits.)

## Usage guidelines

- **Do not build a set of options out of `ContextMenuItem` plus a hand-drawn tick.** It looks exactly like `ContextMenuCheckboxItem` / `ContextMenuRadioItem`, which is why the mistake is invisible: the element falls back to `role="menuitem"` with no `aria-checked`, so screen reader users hear a few peer actions instead of one group of mutually exclusive options, and cannot tell which one is selected. Use `ContextMenuCheckboxItem` for toggleable settings and `ContextMenuRadioGroup` plus `ContextMenuRadioItem` for exclusive choices.
- `ContextMenuRadioItem` must be nested in a `ContextMenuRadioGroup`, otherwise it never renders a selected state.
- The selection marker occupies a first column as wide as the `size-4` icon of a plain `ContextMenuItem`, so text left edges line up in a mixed menu. Keep icons on plain items at `size-4`.
- Wrap grouped entries in `ContextMenuGroup` and label them with `ContextMenuGroupLabel` for correct group semantics. Bare items form one unlabelled list.
- When `ContextMenuItem` children contain rich content such as an icon, add `label` for keyboard type-ahead.

## Related
[Command](../command/command.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
