---
slug: avatar
name: Avatar
category: data-display
group: info
tags: []
exports: [Avatar]
status: enriched
---

# Avatar

> Displays a user image with fallback content.

## When to use

Use Avatar for one person's image, with initials or other fallback content when the image is missing or fails. Use [[User](../user/user.md)] for an avatar with a name and description, or AvatarCircles for an overlapping group.

## Import
```ts
import { Avatar } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| size | `"sm" \| "md" \| "lg" \| "xl" \| "2xl"` | `"md"` | Preset circular diameter: 32 / 40 / 48 / 64 / 96px. |
| src | `string` | - | Image URL; failures reveal `fallback`. |
| alt | `string` | - | Alternative image text. |
| tone | `"neutral" \| "brand"` | `"neutral"` | Placeholder background: `neutral` is a neutral gray; `brand` uses the accent's subtle background with accent text, for the brand's, system's, or AI's own avatar, or initials that should carry the theme color. A loaded image covers it. |
| ring | `boolean` | `false` | A 2px outer ring whose color follows tone (border for neutral, the accent's subtle border for brand). Use it over colored backgrounds or photos, or when stacking avatars. Inside a primary card the neutral ring becomes translucent white automatically. |
| className | `string` | - | Custom class name. |

## Slots

| Slot | Type | Description |
|------|------|------|
| fallback | `ReactNode` | Content shown without a working image, usually initials. |

## Examples
```tsx
<Avatar src="/demo/avatar-12.jpg" alt="Hulian" fallback="HL" />
```
```tsx
// Fallback without an image
<Avatar size="lg" fallback="H" />
```
```tsx
// Accent-colored initials with a ring; a white ring for a photo on a colored card
<Avatar tone="brand" ring fallback="L" />
<Card variant="primary"><Avatar ring src="/demo/avatar-12.jpg" alt="Abel" fallback="A" /></Card>
```

## Pitfalls

- Base UI reveals `fallback` after a missing or failed `src`; provide it to avoid an empty avatar.
- `size` accepts only sm, md, and lg. Override dimensions through `className` for a custom size.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
