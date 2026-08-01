---
slug: menu
name: Menu
category: navigation
group: global
tags: []
exports: [Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuGroup, MenuGroupLabel, menuItemVariants]
status: enriched
---

# Menu

> Dropdown menu · Base UI command menu with items, separators, groups, and a danger variant · navigation/global

## When to use

Use Menu for a click-triggered set of actions such as Edit, Copy, or Delete. It suits table-row actions, card overflow buttons, and account menus. Use [NavigationMenu](../navigation-menu/navigation-menu.md) for hover-triggered site navigation with mega panels, or [Menubar](../menubar/menubar.md) for several top-level File/Edit/View menus in one row.

## Import
```ts
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuGroup, MenuGroupLabel, menuItemVariants } from "@hulianui/ui"
```

## Props

### MenuContent
| Name | Type | Default | Description |
|------|------|------|------|
| side | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | Preferred side of the trigger on which to place the popup. |
| align | `"start" \| "center" \| "end"` | `"start"` | Alignment along the trigger. |
| sideOffset | `number` | — | Distance from the trigger in pixels. |
| className | `string` | — | Additional class name. |

### MenuItem
| Name | Type | Default | Description |
|------|------|------|------|
| disabled | `boolean` | `false` | Whether the item is unavailable. |
| closeOnClick | `boolean` | `true` | Whether selecting the item closes the menu. |
| label | `string` | — | Text override used by keyboard type-ahead. |
| variant | `"default" \| "danger"` | `"default"` | Visual treatment; use `danger` for destructive actions. |
| className | `string` | — | Additional class name. |

Use `render={<Button />}` on `MenuTrigger` to turn an arbitrary element into the trigger.

## Events

### MenuItem
| Event | Type | Description |
|------|------|------|
| onClick | `MouseEventHandler<HTMLElement>` | Called when the item is clicked. |

## Slots

### MenuContent
| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | Menu entries. |

### MenuItem
| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Item content. |

## Example
```tsx
<Menu>
  <MenuTrigger render={<Button>Menu</Button>} />
  <MenuContent side="bottom" align="start">
    <MenuItem>Edit</MenuItem>
    <MenuItem disabled>Archive (unavailable)</MenuItem>
    <MenuSeparator />
    <MenuItem variant="danger">Delete</MenuItem>
  </MenuContent>
</Menu>
```

With a group (`MenuGroupLabel` must be nested in `MenuGroup`):
```tsx
<MenuContent>
  <MenuGroup>
    <MenuGroupLabel>Actions</MenuGroupLabel>
    <MenuItem>Edit</MenuItem>
    <MenuItem>Copy</MenuItem>
  </MenuGroup>
</MenuContent>
```

## Usage guidelines

- [[base-ui-menu-group-label-requires-menu-group-wrapper]]: placing `MenuGroupLabel` directly in `MenuContent` throws `MenuGroupRootContext is missing` as soon as the menu opens. Always wrap a group label in `MenuGroup`.

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
