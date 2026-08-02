---
slug: navbar
name: Navbar
category: navigation
group: global
tags: []
exports: [Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle]
status: enriched
---

# Navbar

> Navigation bar · Compound Brand/Content/Item/MenuToggle API with sticky positioning and a mobile toggle · navigation/global

## When to use

Use Navbar for a page-level top bar with branding, primary navigation, and a mobile menu toggle. It is a horizontal global header. Use [NavMenu](../nav-menu/nav-menu.md) for a vertical sidebar tree, [NavigationMenu](../navigation-menu/navigation-menu.md) for multilevel navigation with dropdown panels, or [BeianFooter](../beian-footer/beian-footer.md) for a Chinese regulatory footer.

## Import
```ts
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle } from "@hulianui/ui"
```

## Props

Each subcomponent inherits the attributes of its underlying native element.

**Navbar** (`<nav>`)

| Name | Type | Default | Description |
|------|------|------|------|
| sticky | `boolean` | `false` | Whether to keep the bar pinned to the top while scrolling. |
| bordered | `boolean` | `true` | Whether to show a separator border along the bottom. |

**NavbarContent** (`<ul>`)

| Name | Type | Default | Description |
|------|------|------|------|
| justify | `"start" \| "center" \| "end"` | `"start"` | Horizontal alignment of the content. |

**NavbarItem** (`<li>`)

| Name | Type | Default | Description |
|------|------|------|------|
| isActive | `boolean` | — | Marks the current item with `aria-current` and active styling. |

**NavbarMenuToggle**

| Name | Type | Default | Description |
|------|------|------|------|
| isOpen | `boolean` | `false` | Controlled open state. |
| aria-label | `string` | Locale value based on `isOpen` | Accessible label. An explicit value takes precedence over `ConfigProvider`. |
| className | `string` | — | Additional class name. |

`NavbarBrand` is a container with no component-specific props.

## Events

**NavbarMenuToggle**

| Event | Type | Description |
|------|------|------|
| onToggle | `() => void` | Called when the user requests a state change. |

## Slots

`Navbar`, `NavbarContent`, `NavbarItem`, and `NavbarBrand` all accept `children`.

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Content rendered by each container subcomponent. |

## Example
```tsx
function Header() {
  const [open, setOpen] = useState(false);
  return (
    <Navbar sticky bordered>
      <NavbarMenuToggle isOpen={open} onToggle={() => setOpen((v) => !v)} />
      <NavbarBrand>Hulian</NavbarBrand>
      <NavbarContent justify="end" className="hidden sm:flex">
        <NavbarItem isActive>Components</NavbarItem>
        <NavbarItem>Docs</NavbarItem>
        <NavbarItem>Theme</NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
```

## Usage guidelines

Without an explicit `aria-label`, the mobile toggle follows `ConfigProvider locale`: `enUS` provides “Open menu” and “Close menu”, while the no-provider fallback remains Chinese.

- `NavbarMenuToggle` is controlled: maintain `isOpen` and `onToggle` in application state. The component does not render or manage a mobile menu panel, so conditionally render that panel from `open` yourself.
- No other known caveats.

## Related
[BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
