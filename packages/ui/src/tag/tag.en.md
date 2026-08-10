---
slug: tag
name: Tag
category: data-display
group: info
tags: []
exports: [Tag, tagVariants]
status: enriched
---

# Tag

> Status tag · five semantic tones with dot, pulse, icon, and optional close action · data-display/info

## When to use

Use Tag for a compact read-only state or category such as running, pending review, or rejected. Use [[Badge]] for counts or Chip for removable filter tokens.

## Import
```ts
import { Tag, tagVariants } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| variant | `"soft" \| "solid" \| "outline"` | `"soft"` | Visual style. |
| tone | `"neutral" \| "brand" \| "success" \| "warning" \| "danger"` | `"neutral"` | Semantic tone. |
| size | `"sm" \| "md"` | `"md"` | Size. |
| dot | `boolean` | `false` | Leading tone-colored dot. |
| pulse | `boolean` | `false` | Dot breathing animation, effective only with dot. |
| isDisabled | `boolean` | `false` | Lowers opacity and disables pointer actions. |
| className | `string` | — | Root class. |
| …HTMLAttributes | `HTMLAttributes<HTMLSpanElement>` | — | Native span attributes are forwarded. Status tags commonly need `title` to reveal the full value on hover (a cell showing "Word" whose title is the complete MIME type), plus `data-testid` and `aria-*`. |

## Events

| Event | Type | Description |
|------|------|------|
| onClose | `() => void` | Adds a close button and reports activation. |

## Slots

| Slot | Type | Description |
|------|------|------|
| icon | `ReactNode` | Leading icon, taking precedence over dot. |
| children | `ReactNode` | Tag text. |

## Examples
```tsx
<Tag>Default</Tag>
<Tag tone="success">Success</Tag>
<Tag tone="danger">Error</Tag>
```
```tsx
<Tag dot pulse tone="brand">Deploying</Tag>
<Tag onClose={() => remove(id)}>Pending review</Tag>
```

## Usage notes

- Pulse requires dot. Icon and dot are mutually exclusive, with icon winning.
- Closing is controlled by the parent; filter the item from state.
- The close control's accessible label follows `ConfigProvider`: `zhCN` uses `"\u79fb\u9664"` and `enUS` uses “Remove”. Legacy custom locales without `components.tag` keep the Chinese fallback.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
