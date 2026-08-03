---
slug: avatar-circles
name: AvatarCircles
category: data-display
group: info
tags: []
exports: [AvatarCircles, avatarCirclesItemVariants]
status: enriched
---

# AvatarCircles

> An overlapping avatar group with rings and an optional +N overflow count.

## When to use

Use AvatarCircles to show a compact group of participants or members. Use [[Avatar](../avatar/avatar.md)] for one image or User for a person with name and description.

## Import
```ts
import { AvatarCircles, avatarCirclesItemVariants } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| avatars* | `AvatarCirclesItem[]` | — | Ordered `{ src: string; alt?: string }` images; later items overlap earlier ones. |
| extraCount | `number` | — | Additional people rendered in a trailing "+N" circle. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Circle diameter preset. |
| className | `string` | — | Custom class name. |

## Examples
```tsx
const avatars = [
  { src: "/demo/avatar-1.jpg", alt: "User 1" },
  { src: "/demo/avatar-2.jpg", alt: "User 2" },
  { src: "/demo/avatar-3.jpg", alt: "User 3" },
]
<AvatarCircles avatars={avatars} extraCount={9} />
```
```tsx
<AvatarCircles avatars={avatars} size="lg" />
```

## Pitfalls

- Every item requires `src`; unlike Avatar, the group has no fallback slot, so a failed image leaves an empty circle.
- `extraCount` is display-only and is not derived from array length. Pass the actual overflow count.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
