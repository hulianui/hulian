---
slug: marquee
name: Marquee
category: data-display
group: collection
tags: [animated]
exports: [Marquee]
status: enriched
---

# Marquee

> Marquee · seamless CSS loop with direction, hover pause, vertical mode, and edge fades · data-display/collection · #animated

## When to use

Use Marquee to continuously loop logos, technology chips, or testimonials horizontally or vertically. Use [AnimatedList](../animated-list/animated-list.md) for viewport-triggered entrances, or [Sortable](../sortable/sortable.md) for user-controlled order.

## Import
```ts
import { Marquee } from "@hulianui/ui"
```

## Props

Inherits `ComponentPropsWithoutRef<"div">`.

| Name | Type | Default | Description |
|------|------|------|------|
| direction | `"left"\|"right"` | `"left"` | Scroll direction; right reverses the animation. |
| duration | number | 40 | Seconds per cycle; larger is slower. |
| gap | string | `"1rem"` | CSS gap between items. |
| pauseOnHover | boolean | false | Pauses while hovered. |
| repeat | number | 4 | Copies of the content used to prevent gaps. |
| vertical | boolean | false | Uses vertical movement; left means up and right means down. |
| fade | boolean | false | Adds edge fade masks. |
| fadeWidth | string | `"15%"` | Fade-region CSS width. |
| ...div | ComponentPropsWithoutRef\<"div"\> | — | Forwarded props; `className` controls the viewport. |

## Slots

| Slot | Type | Description |
|------|------|------|
| children * | ReactNode | Repeated scrolling content. |

> Showcase controls use duration 20 and enable pause and fade for demonstration. The actual defaults are those listed above.

## Examples
```tsx
<Marquee className="w-80" pauseOnHover>
  {items.map((c) => <Chip key={c}>{c}</Chip>)}
</Marquee>

<Marquee className="w-80" fade pauseOnHover gap="1.25rem">
  {logos.map((Icon, i) => <LogoTile key={i}><Icon className="size-6" /></LogoTile>)}
</Marquee>

<Marquee className="h-56" vertical fade pauseOnHover>
  {items.map((c) => <Chip key={c}>{c}</Chip>)}
</Marquee>
```

## Usage notes

- Give horizontal marquees a width and vertical marquees a height to create a visible viewport.
- Increase `repeat` when short content exposes a gap.
- This is a CSS-only animation; `fadeWidth` applies only when `fade` is true.

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
