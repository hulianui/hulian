---
slug: deploy-status
name: DeployStatus
category: data-display
group: info
tags: []
exports: [DeployStatus]
status: enriched
---

# DeployStatus

> Deployment lifecycle status in badge, dot, or compact icon form, with animated building state.

## When to use

Use DeployStatus for a build or deployment moving from queued through building to ready, error, canceled, or skipped. Use StatusDot for a service's current health instead of a deployment lifecycle.

## Import
```ts
import { DeployStatus } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| status* | `"queued" \| "building" \| "ready" \| "error" \| "canceled" \| "skipped"` | — | Deployment lifecycle state. |
| variant | `"badge" \| "dot" \| "icon"` | `"badge"` | Soft badge, dot with text, or icon-only presentation. |
| size | `"sm" \| "md"` | `"md"` | Component size. |
| spin | `boolean` | `true` | Spins the building icon. |
| className | `string` | — | Custom class name. |

## Slots

| Slot | Type | Description |
|------|------|------|
| label | `ReactNode` | Replaces the built-in Chinese status label. |

## Examples
```tsx
// Default badge
<DeployStatus status="ready" />

// Pulsing building dot and compact error icon
<DeployStatus status="building" variant="dot" />
<DeployStatus status="error" variant="icon" size="sm" />
```

## Pitfalls
DeployStatus describes one deployment's lifecycle, not service health. Built-in labels are `"\u6392\u961f\u4e2d"` ("Queued"), `"\u6784\u5efa\u4e2d"` ("Building"), `"\u5df2\u4e0a\u7ebf"` ("Ready"), `"\u5931\u8d25"` ("Failed"), `"\u5df2\u53d6\u6d88"` ("Canceled"), and `"\u5df2\u8df3\u8fc7"` ("Skipped"). Supply `label` for English runtime copy.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
