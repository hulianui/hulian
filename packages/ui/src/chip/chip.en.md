---
slug: chip
name: Chip
category: data-display
group: info
tags: []
exports: [Chip, chipVariants]
status: enriched
---

# Chip

> Chip · removable text entity with dot, avatar, content slots, tone, and variant · data-display/info

## When to use

Use Chip for a category, filter, or selected token that may be removed. Use [Badge](../badge/badge.md) for corner counts or [Dot](../dot/dot.md) for a bare status.

## Import
```ts
import { Chip, chipVariants } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| variant | `"solid"｜"soft"｜"outline"` | `soft` | Visual style. |
| tone | `"brand"｜"danger"｜"neutral"` | `brand` | Semantic tone. |
| size | `"sm"｜"md"` | `md` | Size. |
| dot | `boolean` | — | Leading status dot. |
| isDisabled | `boolean` | — | Lowers opacity and disables pointer actions. |
| className | `string` | — | Root class. |

## Events

| Event | Type | Description |
|------|------|------|
| onClose | `() => void` | Adds and handles the close button. |

## Slots

| Slot | Type | Description |
|------|------|------|
| avatar | `ReactNode` | Leading square avatar. |
| startContent | `ReactNode` | Leading icon when avatar is absent. |
| endContent | `ReactNode` | Content before close. |
| children | `ReactNode` | Chip text. |

## Examples
```tsx
<Chip tone="brand">Brand</Chip>
<Chip tone="danger">Danger</Chip>

{items.map((t) => <Chip key={t} onClose={() => remove(t)}>{t}</Chip>)}
```

## Usage notes

Priority is avatar, startContent, then dot. A close button exists only with `onClose`; disabled chips block it too.

The close control's accessible label follows `ConfigProvider`: `zhCN` uses `"\u79fb\u9664"` and `enUS` uses “Remove”. Legacy custom locales without `components.chip` keep the Chinese fallback.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
