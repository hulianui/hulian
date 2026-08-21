---
slug: menu
name: Menu
category: navigation
group: global
tags: []
exports: [Menu, MenuTrigger, MenuContent, MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuGroup, MenuGroupLabel, MenuSub, MenuSubTrigger, MenuSubContent, menuItemVariants]
status: enriched
---

# Menu

> Presents action items, groups, separators, and a danger treatment in a dropdown. · navigation/global

## When to use

Use Menu for a click-triggered set of actions such as Edit, Copy, or Delete. It suits table-row actions, card overflow buttons, and account menus. Use `MenuSub` to nest options once a single panel no longer holds them. Use [NavigationMenu](../navigation-menu/navigation-menu.md) for hover-triggered site navigation with mega panels, or [Menubar](../menubar/menubar.md) for several top-level File/Edit/View menus in one row.

## Import
```ts
import { Menu, MenuTrigger, MenuContent, MenuItem, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, MenuSeparator, MenuGroup, MenuGroupLabel, MenuSub, MenuSubTrigger, MenuSubContent, menuItemVariants } from "@hulianui/ui"
```

## Props

### MenuContent
| Name | Type | Default | Description |
|------|------|------|------|
| side | `"top" \| "right" \| "bottom" \| "left"` | `"bottom"` | Preferred side of the trigger on which to place the popup. |
| align | `"start" \| "center" \| "end"` | `"start"` | Alignment along the trigger. |
| sideOffset | `number` | `6` | Distance from the trigger in pixels. |
| className | `string` | - | Additional class name. |

### MenuItem
| Name | Type | Default | Description |
|------|------|------|------|
| render | `ReactElement` | - | Render as another element (a Next `<Link>` or an `<a>`); the item's props, `role="menuitem"`, and keyboard roving all merge into it. **Use this for navigation items instead of `onClick` + `router.push`** (see "Navigation menu items"). |
| disabled | `boolean` | `false` | Whether the item is unavailable. |
| closeOnClick | `boolean` | `true` | Whether selecting the item closes the menu. |
| label | `string` | - | Text override used by keyboard type-ahead. |
| variant | `"default" \| "danger"` | `"default"` | Visual treatment; use `danger` for destructive actions. |
| className | `string` | - | Additional class name. |

### MenuCheckboxItem
A setting that can be toggled on or off. Renders `role="menuitemcheckbox"` plus `aria-checked`.

| Name | Type | Default | Description |
|------|------|------|------|
| checked | `boolean` | - | Whether the item is ticked (controlled). For an uncontrolled item use `defaultChecked` instead. |
| defaultChecked | `boolean` | `false` | Whether the item is initially ticked (uncontrolled). |
| disabled | `boolean` | `false` | Whether the item is unavailable. |
| closeOnClick | `boolean` | `false` | Whether selecting the item closes the menu. Checkbox items keep the menu open by default so several can be toggled in a row. |
| label | `string` | - | Text override used by keyboard type-ahead. |
| variant | `"default" \| "danger"` | `"default"` | Visual treatment; use `danger` for destructive actions. |
| className | `string` | - | Additional class name. |

### MenuRadioGroup
Container for a set of mutually exclusive options. It owns the selected value, so every `MenuRadioItem` must be nested inside one.

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string` | - | Value of the currently selected item (controlled). For an uncontrolled group use `defaultValue` instead. |
| defaultValue | `string` | - | Value of the initially selected item (uncontrolled). |
| disabled | `boolean` | `false` | Whether the whole group is unavailable. |
| className | `string` | - | Additional class name. |

### MenuRadioItem
One option in a mutually exclusive set. Renders `role="menuitemradio"` plus `aria-checked`.

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `string` | - | Value of this item; it is selected when it equals the value of its `MenuRadioGroup`. |
| disabled | `boolean` | `false` | Whether the item is unavailable. |
| closeOnClick | `boolean` | `false` | Whether selecting the item closes the menu. Radio items keep the menu open by default, so pass `true` if picking a value should dismiss it. |
| label | `string` | - | Text override used by keyboard type-ahead. |
| variant | `"default" \| "danger"` | `"default"` | Visual treatment; use `danger` for destructive actions. |
| className | `string` | - | Additional class name. |

### MenuSubTrigger
A menu item that opens a cascading submenu, marked with a trailing chevron. It must sit inside a `MenuSub` alongside a `MenuSubContent`.

| Name | Type | Default | Description |
|------|------|------|------|
| disabled | `boolean` | `false` | Whether the item is unavailable, so its submenu cannot be opened. |
| label | `string` | - | Text override used by keyboard type-ahead. |
| variant | `"default" \| "danger"` | `"default"` | Visual treatment; use `danger` for destructive actions. |
| className | `string` | - | Additional class name. |

There is no `closeOnClick`: clicking the item opens the next level rather than performing an action.

### MenuSubContent
The submenu panel, expanded from the right side of its parent item. Its placement is fixed (`side="right"` and `align="start"`) and `side` / `align` / `sideOffset` are not exposed; Base UI flips the panel automatically when it would overflow.

| Name | Type | Default | Description |
|------|------|------|------|
| className | `string` | - | Additional class name. |

Use `render={<Button />}` on `MenuTrigger` to turn an arbitrary element into the trigger. `MenuSub` is a purely structural part that binds one `MenuSubTrigger` to one `MenuSubContent`.

## Events

### MenuItem
| Event | Type | Description |
|------|------|------|
| onClick | `MouseEventHandler<HTMLElement>` | Called when the item is clicked. |

### MenuCheckboxItem
| Event | Type | Description |
|------|------|------|
| onCheckedChange | `(checked: boolean) => void` | Called when the item is ticked or unticked. |
| onClick | `MouseEventHandler<HTMLElement>` | Called when the item is clicked. |

### MenuRadioGroup
| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string) => void` | Called when the selected value changes. |

### MenuRadioItem
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

### MenuCheckboxItem / MenuRadioItem
| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Item content, rendered in the second column, to the right of the selection marker. |

### MenuRadioGroup
| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | A set of `MenuRadioItem` elements. |

### MenuSubTrigger
| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Item content. The component appends the chevron itself, so do not draw one. |

### MenuSub / MenuSubContent
| Slot | Type | Description |
|------|------|------|
| children* | `ReactNode` | `MenuSub` holds one `MenuSubTrigger` plus one `MenuSubContent`; `MenuSubContent` holds the submenu entries. |

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

Checkbox and radio items (the current value carries a tick):
```tsx
<MenuContent>
  <MenuGroup>
    <MenuGroupLabel>Display</MenuGroupLabel>
    <MenuCheckboxItem defaultChecked>Show grid</MenuCheckboxItem>
    <MenuCheckboxItem>Show rulers</MenuCheckboxItem>
  </MenuGroup>
  <MenuSeparator />
  <MenuGroup>
    <MenuGroupLabel>Priority</MenuGroupLabel>
    <MenuRadioGroup value={priority} onValueChange={setPriority}>
      <MenuRadioItem value="low" closeOnClick>Low</MenuRadioItem>
      <MenuRadioItem value="medium" closeOnClick>Medium</MenuRadioItem>
      <MenuRadioItem value="high" closeOnClick>High</MenuRadioItem>
    </MenuRadioGroup>
  </MenuGroup>
</MenuContent>
```
(`closeOnClick` here dismisses the menu once a value is picked; it defaults to `false`, which keeps the menu open for further edits.)

A cascading submenu, which groups options by dimension and suits filter menus holding dozens of choices:
```tsx
<MenuContent>
  <MenuItem>All tasks</MenuItem>
  <MenuSeparator />
  <MenuSub>
    <MenuSubTrigger>Status</MenuSubTrigger>
    <MenuSubContent>
      <MenuItem>To do</MenuItem>
      <MenuItem>Ongoing</MenuItem>
      <MenuItem>Completed</MenuItem>
    </MenuSubContent>
  </MenuSub>
</MenuContent>
```
`MenuSub` nests to any depth: put the next `MenuSub` inside a `MenuSubContent`.

## Usage guidelines

- **Do not build a set of options out of `MenuItem` plus a hand-drawn tick.** It looks exactly like `MenuCheckboxItem` / `MenuRadioItem`, which is why the mistake is invisible: the element falls back to `role="menuitem"` with no `aria-checked`, so screen reader users hear a few peer actions instead of one group of mutually exclusive options, and cannot tell which one is selected. Keyboard users are left with a purely visual selected state. Use `MenuCheckboxItem` for toggleable settings and `MenuRadioGroup` plus `MenuRadioItem` for exclusive choices.
- `MenuRadioItem` must be nested in a `MenuRadioGroup`. The group owns the selected value, so an item placed directly in `MenuContent` never renders a selected state.
- The selection marker occupies a first column as wide as the `size-4` icon of a plain `MenuItem`, so text left edges line up when plain and selectable items share one menu. Keep icons on plain items at `size-4` for that alignment to hold.
- [[base-ui-menu-group-label-requires-menu-group-wrapper]]: placing `MenuGroupLabel` directly in `MenuContent` throws `MenuGroupRootContext is missing` as soon as the menu opens. Always wrap a group label in `MenuGroup`.
- `MenuSubTrigger` and `MenuSubContent` must share one `MenuSub`, and that `MenuSub` must sit inside a `MenuContent`. Replacing `MenuSubTrigger` with a `MenuItem` plus a hand-drawn arrow is an invisible mistake: it looks the same, but without `aria-haspopup` and `aria-expanded` screen reader users cannot tell the entry leads to another level.
- Do not use `MenuContent side="right"` as a submenu panel. Inside a `MenuSub` it does render as one, because both are the same Portal/Positioner/Popup underneath, but the chevron, the `sideOffset`, and the parent item staying highlighted while expanded all become your job, and missing any one of them makes the submenu inconsistent with the rest of the library. `MenuSubContent` is the layer that pins those three down.
- The menu ships with `max-h-[min(24rem,var(--available-height))] overflow-y-auto`: no visual difference when everything fits, internal scrolling once it does not. This is a library-level guarantee rather than something every consumer must remember, because the popup is fixed-positioned: whatever overflows the viewport is neither clickable nor reachable by page scroll, and it only shows up once the data grows (three items in development, forty in production). Override `max-h-*` through `className` for a different ceiling. `ContextMenu` behaves the same.

### Navigation menu items

An item that takes the user to another page should render as a real link via `render`, not `onClick` + `router.push`:

```tsx
<MenuItem render={<Link href="/settings/roles" />}>Roles</MenuItem>
```

This is not a style preference. A real `<a href>` carries a whole set of browser behaviors: middle-click, Cmd/Ctrl-click to open in a new tab, the "Open link in new tab" context menu, and the href preview in the status bar on hover. In an admin console, "I want this settings page open in a second tab" is routine. Whoever hijacks the click has to reimplement each of those, and missing one reads to users as "this menu can't be opened in a new tab".

`MenuCheckboxItem` / `MenuRadioItem` / `MenuSubTrigger` have no `render`: they mean "toggle a state" or "open the next level", not "go somewhere".

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
