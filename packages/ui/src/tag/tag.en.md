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

> Status tag · six semantic tones plus arbitrary category colours (color), with dot, pulse, icon, and optional close action · data-display/info

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
| color | `string` | - | Category colour: channel, business line, file type — "which kind is this", independent of state (see Semantic tone vs category colour). Accepts semantic names (`chart-2`, `primary`, …), any CSS colour, or `var(--color-*)`, through the same resolver as [[Dot]]'s and [[Brand]]'s `color`. Wins over `tone` when both are set. |
| size | `"sm" \| "md"` | `"md"` | Size. |
| dot | `boolean` | `false` | Leading tone-colored dot. |
| pulse | `boolean` | `false` | Dot breathing animation, effective only with dot. |
| isDisabled | `boolean` | `false` | Lowers opacity and disables pointer actions. |
| className | `string` | - | Root class. |
| …HTMLAttributes | `HTMLAttributes<HTMLSpanElement>` | - | Native span attributes are forwarded. Status tags commonly need `title` to reveal the full value on hover (a cell showing "Word" whose title is the complete MIME type), plus `data-testid` and `aria-*`. |

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
```tsx
// Category colours — for the dozen-plus categories that six semantic tones cannot carry
<Tag color="chart-1">TikTok</Tag>
<Tag color="chart-4">Bilibili</Tag>
<Tag color="#ec4899">Custom colour</Tag>
```

## Surface recipes

When you build a semantic highlight of your own (not a Tag, not an Alert, just a block you assemble), follow this table. It is the recipe this component uses internally:

| Step | Fill | Text |
|---|---|---|
| solid | `bg-warning` | `text-warning-foreground` |
| soft | `bg-warning-subtle` (or `bg-warning/12`) | `text-warning` |
| outline | `border-warning` | `text-warning` |

**`-foreground` only matches a solid fill**: in light mode it is plain white. Reaching for `text-warning-foreground` on a tint by naming intuition gives you white on white and the text disappears, while dark mode looks right, because `-foreground` is near-black there, so whoever develops in dark mode never sees it. On a tint the text colour is always the semantic colour itself.

## Semantic tone vs category colour

- `tone` is the **semantic** axis: six state colours shared across the library, answering "what state is this in" — success, warning, error, in progress, neutral note, related to the primary action.
- `color` is the **category** axis: answering "which kind is this", independent of state. Channels, business lines, file types and tagging systems routinely need a dozen-plus colours; six semantic tones cannot carry them, and forcing a mapping makes "success" and "channel A" share one green, so readers reverse-engineering meaning from colour get it wrong.
- When both are set, `color` wins (`tone` is the semantic shortcut). Category colours follow the theme too: soft is a 12% mix, outline is a stroke, solid is a fill — no per-colour light/dark pair required.
- Very light category colours (amber `chart-3`, for instance) use `primary-foreground` as the solid foreground, where white text is weak — prefer soft or outline for those.

## Usage notes

- **`brand` and `info` are not the same thing** (#232). `brand` is the primary color and means "this relates to the product or the primary action"; `info` uses its own info color and means "this is a neutral statement of fact, just read it". Reach for `info` when a tag states which mode something is in, neither a success nor a warning. `brand` makes an unclickable tag compete with the primary call to action, while `neutral` blends into every other grey tag on the screen. The two were literally the same color before tokens 0.8.0 added `--color-info`; see the same history in [Alert](../alert/alert.md).
- `color` is **not** a seventh semantic tone. Keep using `tone` for state; writing "success" as `color="chart-2"` turns a semantic into a series colour, and the meaning drifts when the theme changes.
- Pulse requires dot. Icon and dot are mutually exclusive, with icon winning.
- Closing is controlled by the parent; filter the item from state.
- The close control's accessible label follows `ConfigProvider`: `zhCN` uses `"\u79fb\u9664"` and `enUS` uses “Remove”. Legacy custom locales without `components.tag` keep the Chinese fallback.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
