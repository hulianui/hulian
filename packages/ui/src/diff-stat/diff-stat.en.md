---
slug: diff-stat
name: DiffStat
category: data-display
group: info
tags: []
exports: [DiffStat, splitBlocks]
status: enriched
---

# DiffStat

> A compact Git diff statistic with addition and deletion counts, proportional blocks, and optional A/M/D/R status.

## When to use

Use DiffStat in pull-request or commit lists to summarize a file's additions, deletions, and change status. Use [Sparkline](../sparkline/sparkline.md) for trends or [FileTree](../file-tree/file-tree.md) for hierarchical changed-file navigation.

## Import
```ts
import { DiffStat, splitBlocks } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| additions* | `number` | — | Number of added lines. |
| deletions* | `number` | — | Number of deleted lines. |
| status | `"added" \| "modified" \| "deleted" \| "renamed"` | — | Optional file-status badge. |
| blocks | `number` | `5` | Total number of proportional blocks. |
| showCounts | `boolean` | `true` | Shows the addition and deletion counts. |
| size | `"sm" \| "md"` | `"md"` | Component size. |
| className | `string` | — | Custom class name. |

## Examples
```tsx
<DiffStat additions={24} deletions={6} status="modified" />
<DiffStat additions={142} deletions={0} status="added" />
```

Render only the block bar:
```tsx
<DiffStat additions={7} deletions={2} showCounts={false} size="sm" />
```

## Pitfalls

The bar divides `blocks` according to the `additions:deletions` ratio through the pure `splitBlocks` helper. When both counts are zero, the bar remains empty.

Status badge accessibility text remains Chinese at runtime: `"\u65b0\u589e"` ("Added"), `"\u4fee\u6539"` ("Modified"), `"\u5220\u9664"` ("Deleted"), and `"\u91cd\u547d\u540d"` ("Renamed").

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md) · [Dot](../dot/dot.md)
