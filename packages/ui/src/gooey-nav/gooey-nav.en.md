---
slug: gooey-nav
name: GooeyNav
category: navigation
group: global
tags: [animated]
exports: [GooeyNav]
status: enriched
---

# GooeyNav

> Gooey navigation · Spring pill slider and chart-token particles fused through blur and contrast, with controlled or uncontrolled state and reduced-motion support · navigation/global · #animated

## When to use

Use GooeyNav for a highly animated horizontal navigation bar with a ceremonial particle burst, usually on a marketing page or portfolio. Use [NavigationMenu](../navigation-menu/navigation-menu.md) or [NavMenu](../nav-menu/nav-menu.md) when dropdowns, hierarchy, and keyboard conventions matter most, or [Navbar](../navbar/navbar.md) for structural header layout. Set `particleCount={0}` for a sliding pill closer to [PillNav](../pill-nav/pill-nav.md).

## Import
```ts
import { GooeyNav } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `GooeyNavItem[]` | — | At least one `{ label, href? }` entry; href defaults to `"#"`. |
| initialActiveIndex | `number` | `0` | Initial selection in uncontrolled mode. |
| activeIndex | `number` | — | Controlled selected index. |
| animationTime | `number` | `600` | Particle burst duration in milliseconds. |
| particleCount | `number` | `14` | Particles per switch; zero keeps only the pill. |
| particleDistances | `[number, number]` | `[86, 12]` | Initial burst and return radii in pixels. |
| colors | `number[]` | `[1, 2, 3, 1, 4]` | Chart-token indices from 1 through 5. |
| className | `string` | — | Root class name. |
| style | `CSSProperties` | — | Root inline styles. |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(index: number) => void` | Called by click, Enter\|Space. |

## Example
```tsx
<GooeyNav items={[{ label: "Home", href: "#" }, { label: "Product", href: "#" }, { label: "Docs", href: "#" }, { label: "About", href: "#" }]} />
```

Pill only:
```tsx
<GooeyNav items={items} particleCount={0} />
```

## Usage guidelines

- With activeIndex, update parent state from onChange. Controlled state does not update internally.
- A dark overflow-hidden container best supports the blur/contrast fusion; light backgrounds and poor clipping reduce the effect.
- Reduced motion skips particles and spring travel while preserving selection.

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
