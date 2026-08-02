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

> Status dot · five semantic tones or any CSS color, three sizes, optional pulse, and accessible status labeling · data-display/info

## When to use

Use Dot for the smallest online, processing, warning, or error indicator. Use [StatusDot](../status-dot/status-dot.md) for a complete health row or [Badge](../badge/badge.md) for corner counts.

## Import
```ts
import { Dot } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| tone | `"neutral"\|"brand"\|"success"\|"warning"\|"danger"` | `neutral` | Semantic color. |
| color | `string` | — | Any dot color: a semantic color name such as `chart-2` or `primary`, any CSS color, or a CSS variable resolved through `resolveTone`. Takes precedence over `tone`, and keeps custom chart legends in sync with their series. |
| size | `"sm"\|"md"\|"lg"` | `md` | Dot size. |
| pulse | `boolean` | `false` | Breathing animation for active states. |
| label | `string` | — | Adds `role=status` and an accessible label; omission makes it decorative. |

## Examples
```tsx
<Dot tone="success" />

<Dot tone="success" pulse label="Online" />

// Custom chart legend using the same color source as each series
{series.map((s, i) => (
  <span key={s.key} className="inline-flex items-center gap-1.5">
    <Dot size="sm" color={s.color ?? `chart-${i + 1}`} />
    {s.label}
  </span>
))}
```

## Usage notes

- **`style={{ color }}` does not change the dot and fails silently.** The dot is painted with a background color, while the CSS `color` property affects text. Use the `color` prop for custom colors.
- Provide `label` whenever the dot conveys status. Without it, the dot is `aria-hidden` and treated as decoration.
- `tone` intentionally covers only five semantic colors. Use `color` for chart-series colors such as `chart-1` through `chart-6` instead of rebuilding the dot with Tag or a bare `<span>`.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
