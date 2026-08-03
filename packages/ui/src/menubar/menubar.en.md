---
slug: menubar
name: Menubar
category: navigation
group: global
tags: []
exports: [Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarGroup, MenubarGroupLabel]
status: enriched
---

# Menubar

> Menu bar · Thin Base UI menubar wrapper for top-level File/Edit/View menus, using the Menu skin with keyboard switching and arrow-key navigation · navigation/global

## When to use

Use Menubar for a desktop-style horizontal menu bar where each top-level entry, such as File, Edit, or View, opens a dropdown. Arrow keys move among the top-level entries and an adjacent menu can take over while the bar is open. Use [Menu](../menu/menu.md) for one trigger and one set of actions, or [NavigationMenu](../navigation-menu/navigation-menu.md) for rich site-navigation panels.

## Import
```ts
import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarSeparator, MenubarGroup, MenubarGroupLabel } from "@hulianui/ui"
```

## Props

The root `Menubar` forwards Base UI `Menubar` props and adds `className`. `MenubarMenu` and `MenubarTrigger` forward their corresponding Base UI Menu props. Dropdown parts—Item, Separator, Group, and GroupLabel—reuse [Menu](../menu/menu.md) styling and behavior; for example, `MenubarItem` supports `variant="danger"`.

| Name | Type | Default | Description |
|------|------|------|------|
| modal | `boolean` | `true` | Whether background content becomes non-interactive while a menu is open. |
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | Menu-bar orientation. |
| loopFocus | `boolean` | `true` | Whether arrow-key focus wraps after the last item. |
| disabled | `boolean` | `false` | Whether the entire bar is disabled. |
| className | `string` | — | Additional class name. |

`MenubarMenu` forwards Base UI `Menu.Root` props such as `open`, `defaultOpen`, and `onOpenChange`; `MenubarTrigger` forwards `Menu.Trigger` props.

## Events

### MenubarMenu
| Event | Type | Description |
|------|------|------|
| onOpenChange | `(open: boolean) => void` | Called when a top-level menu opens or closes; forwarded to Base UI `Menu.Root`. |

## Example
```tsx
<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>New window</MenubarItem>
      <MenubarSeparator />
      <MenubarItem variant="danger">Quit</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
  {/* More top-level menus */}
</Menubar>
```

## Usage guidelines

- As with [Menu](../menu/menu.md), `MenubarGroupLabel` must be nested in `MenubarGroup`; otherwise opening the menu throws a missing `GroupRootContext` error.
- Put only `MenubarTrigger` and `MenubarContent` inside each top-level `MenubarMenu`. Menu entries belong inside Content, not directly under `Menubar`.

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Dock](../dock/dock.md)
