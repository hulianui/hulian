---
slug: flowing-menu
name: FlowingMenu
category: navigation
group: global
tags: [animated]
exports: [FlowingMenu]
status: enriched
---

# FlowingMenu

> Vertical flowing menu · Pointer-edge entrance detection revealing a looping text and image marquee with CSS keyframes, transitions, tokens, and reduced-motion support · navigation/global · #animated

## When to use

Use FlowingMenu for a full-height portfolio or brand directory with large vertical items that reveal a text/image marquee from the pointer's entry direction. Use [BubbleMenu](../bubble-menu/bubble-menu.md) for fullscreen pills, [CardNav](../card-nav/card-nav.md) for expanding cards, or [NavigationMenu](../navigation-menu/navigation-menu.md) and [NavMenu](../nav-menu/nav-menu.md) for conventional multilevel navigation.

## Import
```ts
import { FlowingMenu } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items * | `FlowingMenuItem[]` | — | Menu entries. |
| speed | `number` | `18` | Seconds for the marquee to travel one viewport; larger is slower. |
| repeat | `number` | `4` | Text repetitions per block for continuous coverage. |

The component also inherits `ComponentPropsWithoutRef<"nav">` except `children`, so `className` and `style` pass through.

`FlowingMenuItem`

| Name | Type | Default | Description |
|------|------|------|------|
| link * | `string` | — | Link destination. |
| text * | `string` | — | Copy used as both the main title and the marquee text. |
| image | `string` | — | Image repeated inside the marquee. Without it only text repeats and no image block renders. |

## Example
```tsx
<div className="h-80 overflow-hidden rounded-xl border border-border">
  <FlowingMenu items={[{ link: "#discover", text: "Discover", image: "/a.jpg" }, { link: "#build", text: "Build", image: "/b.jpg" }]} />
</div>

<FlowingMenu items={[{ link: "#home", text: "Home" }]} speed={30} repeat={6} />
```

## Usage guidelines

- Place the nav in an explicitly sized, overflow-hidden container so items have vertical space and the marquee stays clipped.
- Marquee and reveal effects degrade under reduced motion.
- No other known caveats.

## Related
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
