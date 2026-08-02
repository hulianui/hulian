---
slug: status-dot
name: StatusDot
category: data-display
group: info
tags: []
exports: [StatusDot]
status: enriched
---

# StatusDot

> Health status · online, degraded, offline, and maintenance mapping to semantic dots, optional pulse, label, and trailing metric · data-display/info

## When to use

Use StatusDot for a channel, model, or service health row. It wraps [Dot](../dot/dot.md) with four health meanings, text, and a metric slot. Use [Badge](../badge/badge.md) for counts.

## Import
```ts
import { StatusDot } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| status* | `"online"\|"degraded"\|"offline"\|"maintenance"` | — | Maps to success, warning, danger, or neutral. |
| pulse | `boolean` | Online only | Explicitly overrides automatic online pulse. |
| size | `"sm"\|"md"\|"lg"` | `md` | Size. |

## Slots

| Slot | Type | Description |
|------|------|------|
| label | `ReactNode` | Status text announced with the dot. |
| extra | `ReactNode` | Trailing latency or success metric. |

## Examples
```tsx
<StatusDot status="online" label="Online" extra="86ms" />

<StatusDot status="degraded" label="Degraded" extra="412ms" />
```

## Usage notes

Only online pulses by default; pass `pulse` to animate another state. Backend status and macOS menu-item notes are unrelated.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
