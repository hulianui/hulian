---
slug: dot
name: Dot
category: data-display
group: info
tags: []
exports: [Dot]
status: enriched
---

# Dot

> Status dot · five semantic tones, three sizes, optional pulse, and accessible status labeling · data-display/info

## When to use

Use Dot for the smallest online, processing, warning, or error indicator. Use [StatusDot](../status-dot/status-dot.md) for a complete health row or [Badge](../badge/badge.md) for corner counts.

## Import
```ts
import { Dot } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| tone | `"neutral"｜"brand"｜"success"｜"warning"｜"danger"` | `neutral` | Semantic color. |
| size | `"sm"｜"md"｜"lg"` | `md` | Dot size. |
| pulse | `boolean` | `false` | Breathing animation for active states. |
| label | `string` | — | Adds `role=status` and an accessible label; omission makes it decorative. |

## Examples
```tsx
<Dot tone="success" />

<Dot tone="success" pulse label="Online" />
```

## Usage notes

No known caveats. Provide `label` when the dot conveys status. Tauri event-name and timeline alignment notes are unrelated.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
