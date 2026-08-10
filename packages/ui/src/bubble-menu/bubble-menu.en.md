---
slug: bubble-menu
name: BubbleMenu
category: navigation
group: global
tags: [animated]
exports: [BubbleMenu]
status: enriched
---

# BubbleMenu

> Bubble navigation · Logo and hamburger opening a fullscreen field of rotated pill links with spring scaling, staggered labels, Motion, and reduced-motion support · navigation/global · #animated

## When to use

Use BubbleMenu for a highly expressive fullscreen primary navigation on a marketing site or portfolio. Use [NavigationMenu](../navigation-menu/navigation-menu.md) or [NavMenu](../nav-menu/nav-menu.md) for conventional multilevel navigation, [Navbar](../navbar/navbar.md) for an application header, or [CardNav](../card-nav/card-nav.md) for an expanding card menu.

## Import
```ts
import { BubbleMenu } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items | `BubbleMenuItem[]` | Built-in examples | Menu items. The five built-in labels and item labels are `"\u9996\u9875"` (“Home”), `"\u5173\u4e8e"` (“About”), `"\u4f5c\u54c1"` (“Work”), `"\u535a\u5ba2"` (“Blog”), and `"\u8054\u7cfb"` (“Contact”). |
| menuAriaLabel | `string` | `"\u5207\u6362\u83dc\u5355"` | Toggle accessible label; built-in Chinese means “Toggle menu.” |
| useFixedPosition | `boolean` | `false` | Fixed to the viewport when true, or absolute within the nearest positioned ancestor. |
| animationDuration | `number` | `0.5` | Pill entrance duration in seconds. |
| staggerDelay | `number` | `0.12` | Delay between adjacent pill entrances in seconds. |
| className | `string` | — | Root nav class name. |
| style | `CSSProperties` | — | Root inline styles. |

`BubbleMenuItem`

| Name | Type | Default | Description |
|------|------|------|------|
| label * | `string` | — | Link text. |
| href * | `string` | — | Link destination. |
| ariaLabel | `string` | Falls back to `label` | Accessible label. |
| rotation | `number` | — | Desktop pill rotation in degrees for a hand-placed feel; it resets to zero on mobile. |
| hoverStyles | `{ bgColor?: string; textColor?: string }` | — | Inverted colors on hover. |

## Events

| Event | Type | Description |
|------|------|------|
| onMenuClick | `(isOpen: boolean) => void` | Reports the next open state. |

## Slots

| Slot | Type | Description |
|------|------|------|
| logo | `ReactNode` | Upper-left logo bubble. A string is treated as an image source; a ReactNode renders directly. |

## Example
```tsx
<div className="relative h-96 overflow-hidden rounded-xl"><BubbleMenu logo={<span>Hulian</span>} /></div>

const items = [
  { label: "Home", href: "#", rotation: -6, hoverStyles: { bgColor: "var(--color-chart-1)", textColor: "var(--color-primary-foreground)" } },
  { label: "Docs", href: "#", rotation: 6, hoverStyles: { bgColor: "var(--color-chart-2)", textColor: "var(--color-primary-foreground)" } },
];
<BubbleMenu logo={<span>Hulian</span>} items={items} />
```

## Usage guidelines

- With the default absolute positioning, provide a positioned ancestor. Use fixed positioning for a real viewport-level site header.
- The parent needs overflow-hidden to contain the expanded layer.
- Token colors require the `--color-` prefix. Entrances degrade under reduced motion.
- The root and fallback link labels are built-in Chinese `"\u4e3b\u5bfc\u822a"` (“Primary navigation”) and `"\u83dc\u5355\u94fe\u63a5"` (“Menu link”).

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
