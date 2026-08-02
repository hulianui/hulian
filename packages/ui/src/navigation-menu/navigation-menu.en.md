---
slug: navigation-menu
name: NavigationMenu
category: navigation
group: global
tags: []
exports: [NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink]
status: enriched
---

# NavigationMenu

> Navigation menu · Thin Base UI wrapper with mega panels, shared Viewport size transitions, triggers, content, links, and a rotating chevron · navigation/global

## When to use

Use NavigationMenu for primary site navigation that groups links under headings such as Products or Resources and opens rich mega panels with columns, icons, and descriptions. Use [Navbar](../navbar/navbar.md) for a simple row of links, [Menu](../menu/menu.md) for click-triggered commands such as Edit or Delete, or [Menubar](../menubar/menubar.md) for a desktop-style File/Edit/View menu bar.

## Import
```ts
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@hulianui/ui"
```

## Props

The root `NavigationMenu` forwards Base UI `NavigationMenu.Root` props. Each subcomponent forwards the corresponding Base UI part and adds `className`.

| Name | Type | Default | Description |
|------|------|------|------|
| value | `any` | — | Controlled value of the currently open item. |
| defaultValue | `any` | — | Initially open item when uncontrolled. |
| delay | `number` | `100` | Delay before opening on hover, in milliseconds. Use `0` to open immediately. |
| closeDelay | `number` | — | Delay before closing after the pointer leaves, in milliseconds. |
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | Menu-bar orientation. |
| className | `string` | — | Additional root class name. |

Subcomponents accept `className` and forward their matching Base UI props. `NavigationMenuItem` requires `value`; `NavigationMenuLink` forwards anchor attributes such as `href`.

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value) => void` | Called when the open item changes; forwarded to Base UI `NavigationMenu.Root`. |

## Example
```tsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem value="products">
      <NavigationMenuTrigger>Products</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="grid grid-cols-2 gap-1">{/* NavigationMenuLink entries */}</div>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem value="pricing">
      <NavigationMenuLink href="/pricing">Pricing</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

## Usage guidelines

- [[base-ui-navigation-menu-content-must-stay-in-flow-for-popup-size-measure]]: do not add `position: absolute` to an active `NavigationMenuContent`. Base UI measures its natural size to animate the shared Viewport's `--popup-width/height`. Removing it from flow reduces the measured size to zero and can collapse an otherwise valid panel to roughly 2×2 pixels.
- For a plain link without a dropdown, place `NavigationMenuLink` directly inside `NavigationMenuItem`; do not wrap it in Trigger and Content.

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
