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

`GooeyNavItem`

| Name | Type | Default | Description |
|------|------|------|------|
| label * | `string` | — | Displayed text. |
| href | `string` | `"#"` | Link destination. |

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
- **The container must be dark** and `overflow-hidden`: the pill and particles fuse through blur and contrast, so light backgrounds and poor clipping ruin the effect.
- Because the container is always dark, this component uses **fixed black and white steps** (`text-white/80`, `bg-white`) instead of theme tokens. That is deliberate, not a missing token: following the page theme would make `--color-foreground` resolve to `gray-900` in light mode, turning inactive items into dark text on a dark bar. On light surfaces the reverse happens, so reach for [PillNav](../pill-nav/pill-nav.md) or [NavMenu](../nav-menu/nav-menu.md) instead.
- Reduced motion skips particles and spring travel while preserving selection.

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
