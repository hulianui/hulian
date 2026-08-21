---
slug: user
name: User
category: data-display
group: info
tags: []
exports: [User]
status: enriched
---

# User

> Combines an avatar, display name, and supporting description into a compact user row.

## When to use

Use User for a person row or card containing an avatar, name, and email, role, or handle. Use [[Avatar](../avatar/avatar.md)] for only an image, AvatarCircles for a group, or pass User into Comment's author area.

## Import
```ts
import { User } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| avatarProps | `AvatarProps` | - | Props forwarded to the built-in Avatar. |
| className | `string` | - | Custom class name. |

## Slots

| Slot | Type | Description |
|------|------|------|
| name* | `ReactNode` | Primary name. |
| description | `ReactNode` | Secondary email, role, handle, or other context. |

## Examples
```tsx
<User
  name="Hulian"
  description="team@hulian.dev"
  avatarProps={{ src: "/demo/avatar-12.jpg", alt: "Hulian" }}
/>
```
```tsx
// Initial fallback without an image
<User name="Alex Lee" description="Product manager" avatarProps={{ fallback: "AL" }} />
```

## Pitfalls

- Avatar behavior is configured through `avatarProps`; provide `fallback` when no reliable image exists.
- Omitting `description` renders a single-line name.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
