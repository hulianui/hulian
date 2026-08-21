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

> Overlays a count, capped count, custom value, or dot on wrapped content.

## When to use

Use Badge to overlay unread counts, presence dots, or verification marks on icons and avatars. It represents a quantity or binary presence. Use [Chip](../chip/chip.md) for removable category or status labels, or [Dot](../dot/dot.md) for an independent semantic status point.

## Import
```ts
import { Badge } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| count | `number` | - | Numeric count; zero is hidden unless `showZero` is true. |
| max | `number` | `99` | Values above this limit render as `max+`. |
| dot | `boolean` | `false` | Renders only a dot and takes precedence over `count`. |
| showZero | `boolean` | `false` | Keeps a zero count visible. |
| invisible | `boolean` | - | Hides the badge while retaining its wrapped child. |
| tone | `"neutral"\|"brand"\|"success"\|"warning"\|"danger"` | `danger` | Semantic color. |
| variant | `"signal"\|"themed"` | `signal` | Color policy (#295). `signal` uses one solid color plus white text in both themes, which is how notification badges normally look. `themed` follows the theme like any other semantic surface (`bg-danger text-danger-foreground`); pick it when the badge is an inline status chip. `neutral` is unaffected and always follows the theme. |
| size | `"sm"\|"md"` | `md` | Badge size. |
| placement | `"top-right"\|"top-left"\|"bottom-right"\|"bottom-left"` | `top-right` | Overlay corner when `children` is supplied. |
| offset | `[number, number]` | - | `[x, y]` pixel adjustment, where positive values move right and down. |

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

## Pitfalls

- **The `signal` variant needs `@hulianui/tokens` >= 0.10.0** (that release adds `--color-signal-*`). On older versions the component's built-in fallback chain degrades to the `themed` colors rather than rendering a transparent chip; upgrading the tokens package switches it on.
- **Do not override the colors just because the badge is "red with black text" in dark mode.** That is not a bug, it is what `themed` necessarily produces: in dark mode `--color-danger` moves up to the 400 step (#fc5855), so its paired foreground has to flip to near-black for contrast (white text would only reach 3.15, below AA). If you want red with white text, use the default `signal`, whose steps hold up in both themes (danger-600 #d40924: 5.43 against white text, 3.66 against a dark page, 5.21 against a light one).
- The four signal colors are not the same numeric step (danger/brand use 600, success/warning use 700): green and amber are naturally lighter at the same step, and their 600 step only reaches 3.97 / 3.76 against white text, short of the 4.5 AA threshold. The steps were picked by contrast, not by aligning numbers.
