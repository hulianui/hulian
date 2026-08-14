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

> Status tag · six semantic tones with dot, pulse, icon, and optional close action · data-display/info

## When to use

Use Tag for a compact read-only state or category such as running, pending review, or rejected. Use [[Badge]] for counts or Chip for removable filter tokens.

## Import
```ts
import { Tag, tagVariants } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| variant | `"soft" \| "solid" \| "outline"` | `"soft"` | Visual style. See Surface recipes for the fill and text colour of each step. |
| tone | `"neutral" \| "brand" \| "info" \| "success" \| "warning" \| "danger"` | `"neutral"` | Semantic tone. Same value set as [Alert](../alert/alert.md). |
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
```tsx
<Tag tone="info">External browser mode</Tag>
<Tag variant="outline" tone="info">Read only</Tag>
```

## Surface recipes

Building a semantic highlight of your own — not a Tag, not an Alert, just a block you assemble — follow this table. It is the recipe this component uses internally:

| Step | Fill | Text |
|---|---|---|
| solid | `bg-warning` | `text-warning-foreground` |
| soft | `bg-warning-subtle` (or `bg-warning/12`) | `text-warning` |
| outline | `border-warning` | `text-warning` |

**`-foreground` only matches a solid fill**: in light mode it is plain white. Reaching for `text-warning-foreground` on a tint by naming intuition gives you white on white and the text disappears — while dark mode looks right, because `-foreground` is near-black there, so whoever develops in dark mode never sees it. On a tint the text colour is always the semantic colour itself.

## Usage notes

- **`brand` and `info` are not the same thing** (#232). `brand` is the primary color and means "this relates to the product or the primary action"; `info` uses its own info color and means "this is a neutral statement of fact, just read it". Reach for `info` when a tag states which mode something is in — neither a success nor a warning. `brand` makes an unclickable tag compete with the primary call to action, while `neutral` blends into every other grey tag on the screen. The two were literally the same color before tokens 0.8.0 added `--color-info`; see the same history in [Alert](../alert/alert.md).
- Pulse requires dot. Icon and dot are mutually exclusive, with icon winning.
- Closing is controlled by the parent; filter the item from state.
- The close control's accessible label follows `ConfigProvider`: `zhCN` uses `"\u79fb\u9664"` and `enUS` uses “Remove”. Legacy custom locales without `components.tag` keep the Chinese fallback.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
