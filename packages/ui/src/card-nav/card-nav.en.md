---
slug: card-nav
name: CardNav
category: navigation
group: global
tags: [animated]
exports: [CardNav]
status: enriched
---

# CardNav

> Card navigation · Pill header expanding into staggered grouped cards with controlled or uncontrolled state, token colors, Motion, and reduced-motion support · navigation/global · #animated

## When to use

Use CardNav for a marketing header that expands downward into up to three grouped link cards. Use [BubbleMenu](../bubble-menu/bubble-menu.md) for a fullscreen field of pills, [NavigationMenu](../navigation-menu/navigation-menu.md) or [NavMenu](../nav-menu/nav-menu.md) for conventional multilevel navigation, or [Navbar](../navbar/navbar.md) for a standard application header.

## Import
```ts
import { CardNav } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items * | `CardNavItem[]` | — | Card groups, rendered in a row or mobile column; only the first three are used. |
| duration | `number` | `0.4` | Expand/collapse duration in seconds, reduced to zero under reduced motion. |
| open | `boolean` | — | Controlled open state paired with onOpenChange. |
| className | `string` | — | Root class name. |
| style | `CSSProperties` | — | Root inline styles. |

> CardNavItem is `{ label, links?, bgColor?, textColor? }`; links are `{ label, href?, ariaLabel? }`. Card backgrounds default to surface, while chart tokens work well for branded blocks.

## Events

| Event | Type | Description |
|------|------|------|
| onCtaClick | `() => void` | CTA click handler. |
| onOpenChange | `(open: boolean) => void` | Called in controlled and uncontrolled modes. |

## Slots

| Slot | Type | Description |
|------|------|------|
| brand | `ReactNode` | Centered logo or title. |
| ctaLabel | `ReactNode` | CTA copy, default `"Get Started"`; an empty string or null hides it. |

## Example
```tsx
const items = [
  { label: "Product", bgColor: "var(--color-chart-1)", textColor: "var(--color-primary-foreground)", links: [{ label: "Overview", href: "#overview" }, { label: "Pricing", href: "#pricing" }] },
  { label: "Company", bgColor: "var(--color-chart-2)", textColor: "var(--color-primary-foreground)", links: [{ label: "About", href: "#about" }] },
];
<CardNav brand="Hulian UI" items={items} ctaLabel="Get started" />

const [open, setOpen] = useState(false);
<CardNav brand="Hulian UI" items={items} open={open} onOpenChange={setOpen} />
```

## Usage guidelines

- Passing open enters controlled mode; write onOpenChange back to parent state. Omit open for internal state.
- Only the first three items render.
- Hide the CTA with null or an empty string.
- Reduced motion removes the transition without changing the two DOM states. The toggle's built-in Chinese labels are `"\u6536\u8d77\u83dc\u5355"` (“Collapse menu”) and `"\u5c55\u5f00\u83dc\u5355"` (“Expand menu”).

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
