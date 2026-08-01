---
slug: infinite-menu
name: InfiniteMenu
category: data-display
group: collection
tags: [animated]
exports: [InfiniteMenu]
status: enriched
---

# InfiniteMenu

> Spherical menu · draggable CSS 3D items distributed around a sphere, with front-item snapping, an active-item overlay, inertial decay, auto-rotation, and reduced-motion support · data-display/collection · #animated

## When to use

Use InfiniteMenu to turn navigation or gallery entries into an exploratory draggable sphere on a creative home page or portfolio. Use [FlyingPosters](../flying-posters/flying-posters.md) for a scrolling poster corridor, or [TiltedCard](../tilted-card/tilted-card.md) for a single 3D-tilting card.

## Import
```ts
import { InfiniteMenu } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items | `InfiniteMenuItem[]` | `[]` | Items distributed with a Fibonacci sphere. The front item becomes active; an empty array renders a placeholder sphere. |
| scale | `number` | `1` | Sphere scale. Larger values bring larger cards closer. |
| itemSize | `number` | `88` | Item diameter in pixels. |
| autoRotate | `number` | `6` | Y-axis rotation in degrees per second. Zero disables it; reduced motion forces zero. |
| className | `string` | — | Class name forwarded to the root. |
| style | `CSSProperties` | — | Inline styles forwarded to the root. |

## Events

| Event | Type | Description |
|------|------|------|
| onActiveItemChange | `(item: InfiniteMenuItem, index: number) => void` | Called after drag snapping selects the front item. |
| onItemActivate | `(item: InfiniteMenuItem, index: number) => void \| false` | Called from the active action. Return `false` to prevent the default `window.open`. |

`InfiniteMenuItem` is `{ image?: string; title?: string; description?: string; link?: string }`. An HTTP link opens in a new tab; other links are left to `onItemActivate`. Without an image, the title's first character is shown.

## Examples
```tsx
const items = [
  { title: "Overview", description: "Project-wide view", link: "https://example.com" },
  { title: "Tasks", description: "Active workflows" },
  { title: "Members", description: "Team and permissions" },
];

<div className="relative h-80 w-full overflow-hidden rounded-xl">
  <InfiniteMenu items={items} />
</div>

<InfiniteMenu items={items} autoRotate={0} />
```

## Usage notes

- The host needs explicit dimensions because sphere geometry is measured from it.
- Non-HTTP links do not navigate automatically; handle them with `onItemActivate`, for example with `router.push`.
- The component uses CSS 3D and RAF. Reduced motion disables auto-rotation; use a real browser to verify interaction states.
- The action label is built from `"\u6253\u5f00 "` (“Open ”) plus the active title, or falls back to `"\u6253\u5f00\u6fc0\u6d3b\u9879"` (“Open active item”). Placeholder titles use `"\u83dc\u5355\u9879 N"` (“Menu item N”) and descriptions use `"\u5360\u4f4d\u9879 \u00b7 \u4f20\u5165 items \u66ff\u6362"` (“Placeholder · pass items to replace”).

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
