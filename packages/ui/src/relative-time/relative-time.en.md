---
slug: relative-time
name: RelativeTime
category: data-display
group: info
tags: []
exports: [RelativeTime, formatRelative, formatAbsolute]
status: enriched
---

# RelativeTime

> Semantic relative timestamps with automatic refresh, controlled reference time, Chinese or English locale, and absolute hover text.

## When to use

Use RelativeTime for changing labels such as "3 minutes ago", "yesterday", or "in 2 months". Use `formatRelative` and `formatAbsolute` directly when only a string is needed.

## Import
```ts
import { RelativeTime, formatRelative, formatAbsolute } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `Date \| string \| number` | — | Date, ISO string, or millisecond timestamp to display. |
| base | `Date \| string \| number` | — | Fixed reference time; supplying it disables live ticks for deterministic SSR, tests, or lists. |
| updateInterval | `number` | `60000` | Live refresh interval in milliseconds; zero disables updates. |
| locale | `"zh" \| "en"` | `"zh"` | Output language. |
| withTitle | `boolean` | `true` | Shows absolute time in the hover title. |
| className | `string` | — | Custom class name. |

## Examples
```tsx
// Live refresh every minute with absolute hover text
<RelativeTime value={publishedAt} />
```
```tsx
// Shared deterministic reference for a list or SSR
<RelativeTime value={item.createdAt} base={now} locale="en" />
```

## Pitfalls

- Without `base`, every instance uses a live client timer. Set a shared fixed base for deterministic SSR, tests, or a synchronized list.
- The semantic `<time>` uses `suppressHydrationWarning` to tolerate live server/client clock differences.
- Large lists create one 60-second timer per instance. Set `updateInterval={0}` or pass `base` to reduce rerenders.
- The default `locale="zh"` uses runtime tokens `"\u521a\u521a"` ("just now"), `"\u79d2"` ("second"), `"\u5206\u949f"` ("minute"), `"\u5c0f\u65f6"` ("hour"), `"\u5929"` ("day"), `"\u4e2a\u6708"` ("month"), `"\u5e74"` ("year"), `"\u524d"` ("ago"), `"\u540e"` ("later"), `"\u6628\u5929"` ("yesterday"), and `"\u660e\u5929"` ("tomorrow"). Set `locale="en"` for English UI.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
