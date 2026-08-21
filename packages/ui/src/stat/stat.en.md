---
slug: stat
name: Stat
category: data-display
group: stat
tags: []
exports: [Stat]
status: enriched
---

# Stat

> A lightweight KPI card with label, value, directional delta, icon, hint, and chart slot.

## When to use

Use Stat for a dashboard KPI card containing a label, formatted value, comparison trend, and optional icon or sparkline. Use [Statistic](../statistic/statistic.md) for number formatting or countdown without a card, [Chart](../chart/chart.md) for a full chart, or [Meter](../meter/meter.md) for a bounded quantity.

## Import
```ts
import { Stat } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| delta | `number` | - | Percentage change; nonnegative is primary and negative is danger. Omission hides the trend. |
| …HTMLAttributes | `HTMLAttributes<HTMLDivElement>` | - | Forwarded div attributes including className. |

## Slots

| Slot | Type | Description |
|------|------|------|
| label* | `ReactNode` | Metric label. |
| value* | `ReactNode` | Consumer-formatted metric value. |
| deltaLabel | `ReactNode` | Comparison label rendered only with `delta`. |
| hint | `ReactNode` | Independent footnote below the trend. |
| icon | `ReactNode` | Corner icon. |
| chart | `ReactNode` | Graphic such as a KPI sparkline between value and delta. |

## Examples
```tsx
// Positive trend
<Stat label="Monthly GMV" value="$128,400" delta={12.5} deltaLabel="vs last month" icon={<Activity className="size-4" />} className="w-64" />

// No trend
<Stat label="Registered users" value="8,021" icon={<Users className="size-4" />} className="w-64" />

// Independent footnote
<Stat label="Question basket" value="12" hint="Limit 200" className="w-64" />

// Trend and footnote together
<Stat label="Participants" value="38" delta={6.4} deltaLabel="vs previous session" hint="2 missing submissions" className="w-64" />
```

## Pitfalls
- **`deltaLabel` depends on `delta`** and is silently omitted without it. Use `hint` for independent context. Development builds also emit a Chinese console warning for this misuse.
- The exact warning is `"[hulian] Stat \u4f20\u4e86 deltaLabel \u4f46\u6ca1\u6709 delta\uff0c\u5b83\u4e0d\u4f1a\u88ab\u6e32\u67d3\uff1b\u82e5\u60f3\u8981\u4e0e\u8d8b\u52bf\u65e0\u5173\u7684\u6ce8\u811a\u8bf7\u7528 hint\u3002"` ("deltaLabel was supplied without delta; use hint for a trend-independent footnote").
- Omitting `delta` hides the whole trend; its sign automatically determines direction and color.
- `value` is not formatted. Pass ready content or use [Statistic](../statistic/statistic.md) for grouping, precision, and affixes.

## Related
[Statistic](../statistic/statistic.md) · [Chart](../chart/chart.md) · [Meter](../meter/meter.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
