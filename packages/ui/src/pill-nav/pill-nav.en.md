---
slug: pill-nav
name: PillNav
category: navigation
group: global
tags: [animated]
exports: [PillNav]
status: enriched
---

# PillNav

> Pill navigation · CSS fill-on-hover, inverted label, active dot, zero dependencies, RSC safety, and reduced-motion support · navigation/global · #animated

## When to use

Use PillNav for lightweight CSS-only site navigation that can render directly in a server component, often beside a brand logo. Use [GooeyNav](../gooey-nav/gooey-nav.md) for particle bursts, [NavigationMenu](../navigation-menu/navigation-menu.md) or [NavMenu](../nav-menu/nav-menu.md) for multilevel menus, or [Navbar](../navbar/navbar.md) for structural header layout. Every item renders as an anchor, and activeHref matches by string.

## Import
```ts
import { PillNav } from "@hulianui/ui"
```

## Props

Inherits `Omit<HTMLAttributes<HTMLElement>, "children">` on the root nav.

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `PillNavItem[]` | — | `{ href, label, ariaLabel? }` entries rendered as pills. |
| activeHref | `string` | — | Exact href receiving persistent inversion and the active dot. |
| logoHref | `string` | `items[0].href` → `"#"` | Logo destination. |
| logoAriaLabel | `string` | `"Home"` | Logo accessible label. |
| initialLoadAnimation | `boolean` | `true` | Initial logo and pill entrance, skipped under reduced motion. |
| className | `string` | — | Root nav class name. |

PillNavItem is `{ href: string; label: string; ariaLabel?: string }`; ariaLabel falls back to label.

## Slots

| Slot | Type | Description |
|------|------|------|
| logo | `React.ReactNode` | Optional circular logo, usually an image or icon, rotating on hover. |

## Example
```tsx
<PillNav items={[{ href: "#home", label: "Home" }, { href: "#features", label: "Features" }, { href: "#pricing", label: "Pricing" }, { href: "#docs", label: "Docs" }]} activeHref="#home" logo={<Mark />} />
```

Without a logo:
```tsx
<PillNav items={items} activeHref="#features" />
```

## Usage guidelines

- activeHref must exactly equal an item href, including anchors and trailing slashes.
- In sliding-pill designs, inverted text belongs inside and above the pill to avoid delayed color changes; see [[sliding-pill-indicator-inverted-text-lives-in-pill-z-above]].
- An inline wrapper around a block logo can align to the baseline and sit low in a flex row. Use `flex items-center` and `leading-none`; see [[flex-row-pill-offset-from-inline-child-in-block-wrapper]].

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
