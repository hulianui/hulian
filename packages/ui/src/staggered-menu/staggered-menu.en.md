---
slug: staggered-menu
name: StaggeredMenu
category: navigation
group: global
tags: [animated]
exports: [StaggeredMenu]
status: enriched
---

# StaggeredMenu

> Layered slide menu · Toggle with rolling menu/close text, colored paper layers, staggered rotating entries, numbering, social links, Motion, tokens, and reduced-motion support · navigation/global · #animated

## When to use

Use StaggeredMenu for a dramatic fullscreen or full-container side menu on a brand site or portfolio. Use [PillNav](../pill-nav/pill-nav.md) or [GooeyNav](../gooey-nav/gooey-nav.md) for persistent horizontal navigation, and [NavigationMenu](../navigation-menu/navigation-menu.md) or [Menu](../menu/menu.md) for functional dropdowns. In non-fixed mode, mount it in a relative, fixed-height, overflow-hidden container.

## Import
```ts
import { StaggeredMenu } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items | `StaggeredMenuItem[]` | - | Primary entries; an empty array displays “No items.” |
| socialItems | `StaggeredMenuSocial[]` | - | Footer social links used with displaySocials. |
| position | `"left" \| "right"` | `"right"` | Panel and color-layer side. |
| colors | `string[]` | chart-4 / chart-1 layers | Up to four staggered background-layer colors. |
| displaySocials | `boolean` | `true` | Shows the footer only when socialItems is non-empty. |
| displayItemNumbering | `boolean` | `true` | Adds 01, 02, and similar prefixes. |
| accentColor | `string` | `var(--color-primary)` | Numbering, social heading, and hover color. |
| isFixed | `boolean` | `false` | Fixed viewport overlay or absolute parent-filling layer. |
| closeOnClickAway | `boolean` | `true` | Whether outside interaction closes the panel. |
| className | `string` | - | Root class name. |
| style | `CSSProperties` | - | Root inline styles. |

`StaggeredMenuItem` (`StaggeredMenuSocial` is `{ label; link }`)

| Name | Type | Default | Description |
|------|------|------|------|
| label * | `string` | - | Entry text, rendered as a large heading. |
| link | `string` | - | Link destination; without it the entry renders as a non-navigating `<span>`. |
| ariaLabel | `string` | Falls back to `label` | Accessible label. |

## Events

| Event | Type | Description |
|------|------|------|
| onMenuOpen | `() => void` | Called after opening. |
| onMenuClose | `() => void` | Called after closing. |

## Slots

| Slot | Type | Description |
|------|------|------|
| brand | `ReactNode` | Brand beside the trigger. Built-in Chinese `"\u745a\u740f"` means “Hulian.” |

## Example
```tsx
<div className="relative h-96 overflow-hidden rounded-xl border border-border bg-bg">
  <StaggeredMenu items={[{ label: "Home", link: "#home" }, { label: "Product", link: "#product" }, { label: "About", link: "#about" }]} socialItems={[{ label: "GitHub", link: "https://github.com" }]} />
</div>
```

Fullscreen from the left:
```tsx
<StaggeredMenu isFixed position="left" items={items} socialItems={socials} brand="HULIAN" />
```

## Usage guidelines

- Non-fixed mode requires a relative, fixed-height, overflow-hidden parent.
- displaySocials needs non-empty socialItems.
- Pass colors as `var(--color-chart-*)`; bare primary variables can fail in SVG or canvas color contexts.
- Reduced motion shows entries directly. Toggle labels use built-in Chinese `"\u5173\u95ed\u83dc\u5355"` (“Close menu”) and `"\u6253\u5f00\u83dc\u5355"` (“Open menu”).
- The trigger's two visible states are built-in Chinese `"\u83dc\u5355"` (“Menu”) and `"\u5173\u95ed"` (“Close”); the social section heading is `"\u793e\u4ea4"` (“Social”).

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
