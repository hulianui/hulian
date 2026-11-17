---
slug: navbar
name: Navbar
category: navigation
group: global
tags: []
exports: [Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuToggle]
status: enriched
---

# Navbar

> Builds a responsive top navigation bar with brand, links, actions, and mobile menu. · navigation/global

## When to use

Use Navbar for a page-level top bar with branding, primary navigation, and a mobile menu toggle. It is a horizontal global header. Use [NavMenu](../nav-menu/nav-menu.md) for a vertical sidebar tree, [NavigationMenu](../navigation-menu/navigation-menu.md) for multilevel navigation with dropdown panels, or [BeianFooter](../beian-footer/beian-footer.md) for a Chinese regulatory footer.

## Import
```ts
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenu, NavbarMenuToggle } from "@hulianui/ui"
```

## Props

Each subcomponent inherits the attributes of its underlying native element.

**Navbar** (`<nav>`)

| Name | Type | Default | Description |
|------|------|------|------|
| sticky | `boolean` | `false` | Whether to keep the bar pinned to the top while scrolling. |
| bordered | `boolean` | `true` | Whether to show a separator border along the bottom. |
| size | `"md" \| "sm"` | `"md"` | Height: `md` is 64px (admin apps); `sm` is 56px, a compact bar for docs and marketing sites with tighter side padding. |
| variant | `"surface" \| "page"` | `"surface"` | Background: `surface` is a translucent surface color (a panel floating over content); `page` is a translucent page background with a lighter separator (blends into the page). Both blur what's behind. |

**NavbarBrand** (`<div>`)

| Name | Type | Default | Description |
|------|------|------|------|
| grow | `boolean` | `true` | Whether the brand section shares space equally with the `NavbarContent` sections (`flex-1 basis-0`). Three equal columns are what makes `justify="center"` land on the **center of the navbar**; the brand content still hugs the left via `justify-start`, so nothing else moves. Pass `false` for a fixed-width brand (`shrink-0`). Only the two-section layout (brand plus a `justify="start"` section right next to it) needs that. |

**NavbarContent** (`<ul>`)

| Name | Type | Default | Description |
|------|------|------|------|
| justify | `"start" \| "center" \| "end"` | `"start"` | Horizontal alignment of the content. `"center"` centers against the **whole navbar**, provided the brand section grows (see above). |

**NavbarItem** (`<li>`)

| Name | Type | Default | Description |
|------|------|------|------|
| isActive | `boolean` | - | Marks the current item with `aria-current` and active styling. |
| variant | `"text" \| "soft"` | `"text"` | `text` changes only the text color; `soft` fills the active item with the accent's subtle background and hovered items with a neutral one. When the item holds a link directly, the padding moves onto the link so the whole pill is clickable. |

**NavbarMenuToggle**

| Name | Type | Default | Description |
|------|------|------|------|
| isOpen | `boolean` | `false` | Controlled open state. |
| aria-label | `string` | Locale value based on `isOpen` | Accessible label. An explicit value takes precedence over `ConfigProvider`. |
| breakpoint | `"sm" \| "md" \| "lg" \| "xl"` | `"sm"` | Hidden from this breakpoint up, where the horizontal navigation takes over. |
| className | `string` | - | Additional class name. |

**NavbarMenu** (`<ul>`)

| Name | Type | Default | Description |
|------|------|------|------|
| isOpen | `boolean` | `false` | Whether the menu is open. When closed it doesn't render, so its links can't be reached with Tab. |
| breakpoint | `"sm" \| "md" \| "lg" \| "xl"` | `"sm"` | Hidden from this breakpoint up; use the same value as `NavbarMenuToggle`. |

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

// Compact docs-site bar: page-colored background, soft pill items, collapsed below xl
<>
  <Navbar sticky size="sm" variant="page">
    <NavbarMenuToggle isOpen={open} onToggle={toggle} breakpoint="xl" />
    <NavbarBrand grow={false}>Hulian</NavbarBrand>
    <NavbarContent className="hidden xl:flex">
      <NavbarItem variant="soft" isActive><a href="/components">Components</a></NavbarItem>
      <NavbarItem variant="soft"><a href="/blocks">Blocks</a></NavbarItem>
    </NavbarContent>
  </Navbar>
  <NavbarMenu isOpen={open} breakpoint="xl">
    <NavbarItem variant="soft" isActive><a href="/components">Components</a></NavbarItem>
    <NavbarItem variant="soft"><a href="/blocks">Blocks</a></NavbarItem>
  </NavbarMenu>
</>
```

## Usage guidelines

- `NavbarMenuToggle` and `NavbarMenu` are controlled: keep `isOpen` and `onToggle` in application state. Give both the same `breakpoint`, matching the breakpoint where the horizontal `NavbarContent` appears; otherwise widening the window shows the horizontal and vertical menus at once.
- Without an explicit `aria-label`, the mobile toggle follows `ConfigProvider locale`: `enUS` provides “Open menu” and “Close menu”, while the no-provider fallback remains Chinese. An explicit `aria-label` always wins.
- The three-section layout (brand + centered menu + trailing actions) is the default shape: `NavbarBrand` grows by default so all three sections are equal and the centered one truly sits at the navbar center. **A two-section layout (brand plus a `justify="start"` section next to it) must pass `grow={false}`**, otherwise that section is pushed to the one-third mark.
- To let the brand truncate on narrow screens, add `min-w-0` to `NavbarBrand` alongside `truncate`: flex items default to `min-width: auto` and will not shrink without it.

## Related
[BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
