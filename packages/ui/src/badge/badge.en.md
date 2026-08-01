---
slug: badge
name: Badge
category: data-display
group: info
tags: []
exports: [Badge]
status: enriched
---

# Badge

> A count, dot, or custom-content badge that can stand alone or overlay any corner of a host element.

## When to use

Use Badge to overlay unread counts, presence dots, or verification marks on icons and avatars. It represents a quantity or binary presence. Use [Chip](../chip/chip.md) for removable category or status labels, or [Dot](../dot/dot.md) for an independent semantic status point.

## Import
```ts
import { Badge } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| count | `number` | — | Numeric count; zero is hidden unless `showZero` is true. |
| max | `number` | `99` | Values above this limit render as `max+`. |
| dot | `boolean` | `false` | Renders only a dot and takes precedence over `count`. |
| showZero | `boolean` | `false` | Keeps a zero count visible. |
| invisible | `boolean` | — | Hides the badge while retaining its wrapped child. |
| tone | `"neutral"｜"brand"｜"success"｜"warning"｜"danger"` | `danger` | Semantic color. |
| size | `"sm"｜"md"` | `md` | Badge size. |
| placement | `"top-right"｜"top-left"｜"bottom-right"｜"bottom-left"` | `top-right` | Overlay corner when `children` is supplied. |
| offset | `[number, number]` | — | `[x, y]` pixel adjustment, where positive values move right and down. |

## Slots

| Slot | Type | Description |
|------|------|------|
| content | `ReactNode` | Custom badge content, such as an icon; takes precedence over `count` and `dot`. |
| children | `ReactNode` | Host element for an overlaid badge; omit it to render the badge independently. |

## Examples
```tsx
// Standalone overflow count
<Badge count={1000} max={99} />

// Presence dot on an avatar
<Badge dot tone="success" placement="bottom-right">
  <Avatar fallback="H" />
</Badge>
```

## Pitfalls

Precedence is `content` over `dot` over `count`. A zero count hides the badge unless `showZero` is explicit. Circular hosts often need a small outward `offset` to place the badge precisely on their edge.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Dot](../dot/dot.md)
