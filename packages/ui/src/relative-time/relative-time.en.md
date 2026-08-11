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

> Semantic relative timestamps with automatic refresh, controlled reference time, Chinese or English locale, absolute hover text, and a first frame that never reads the system clock.

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
- Without `base` the **first frame renders the absolute time** (`YYYY-MM-DD HH:mm`) and swaps to the relative string after mount. This is deliberate: reading the system clock during render bakes the build moment into SSR or static-export output, so a page visited months later still claims "1 minute ago", whereas the absolute time depends only on `value` and stays true at any moment. The other candidate — using `value` as its own reference so the first frame reads "just now" — was rejected because crawlers and readers without JavaScript would take that falsehood at face value. The swap happens before the browser paints (layout effect), so no visible jump; pass `base` if you need the relative string in the first frame.
- The `suppressHydrationWarning` on `<time>` now only covers a **`value` that differs between server and client** (such as `value={new Date()}`, where the `dateTime` attribute is already two different values). The component itself no longer introduces a mismatch, so do not read it as permission to pass an unstable `value`.
- Large lists create one 60-second timer per instance. Set `updateInterval={0}` or pass `base` to reduce rerenders.
- The default `locale="zh"` uses runtime tokens `"\u521a\u521a"` ("just now"), `"\u79d2"` ("second"), `"\u5206\u949f"` ("minute"), `"\u5c0f\u65f6"` ("hour"), `"\u5929"` ("day"), `"\u4e2a\u6708"` ("month"), `"\u5e74"` ("year"), `"\u524d"` ("ago"), `"\u540e"` ("later"), `"\u6628\u5929"` ("yesterday"), and `"\u660e\u5929"` ("tomorrow"). Set `locale="en"` for English UI.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
