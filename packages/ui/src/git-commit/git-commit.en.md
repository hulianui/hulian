---
slug: git-commit
name: GitCommit
category: data-display
group: info
tags: []
exports: [GitCommit, shortSha, branchTone, type BranchTone]
status: enriched
---

# GitCommit

> Shows a branch, short hash, commit message, and author in inline or stacked form.

## When to use

Use GitCommit in deployment, pull-request, or activity lists to show a branch, short SHA, message, and author. Use [DiffStat](../diff-stat/diff-stat.md) or DeployStatus for build lifecycle details, or Timeline for a chronological event collection.

## Import
```ts
import { GitCommit, shortSha, branchTone, type BranchTone } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| sha* | `string` | - | Full or short commit SHA, truncated to `shaLength`. |
| branch | `string` | - | Branch name shown in a leading chip. |
| author | `string` | - | Author name. |
| href | `string` | - | Link destination for the short SHA. |
| shaLength | `number` | `7` | Displayed SHA length. |
| colorBranch | `boolean` | `true` | Assigns a stable soft color by branch name. |
| layout | `"inline" \| "stacked"` | `"inline"` | Single-line or two-line layout for lists and table cells. |
| size | `"sm" \| "md"` | `"md"` | Component size. |
| className | `string` | - | Custom class name. |

## Slots

| Slot | Type | Description |
|------|------|------|
| message | `ReactNode` | Single-line truncated commit subject; the primary row in stacked mode. |
| avatar | `ReactNode` | Author image such as `<Avatar />`, without a hard dependency. |

## Examples
```tsx
// Inline row
<GitCommit sha="10577b9aaaa" branch="main" message="fix(www): restore chat responses" />

// Two rows with an author and linked SHA
<GitCommit
  layout="stacked"
  sha="36e347faaa"
  branch="main"
  message="feat(www): add global route progress"
  author="Hulian"
  avatar={<Avatar fallback="H" />}
  href="#36e347f"
/>
```

## Pitfalls
`shortSha` and `branchTone` are exported pure helpers for reuse and testing outside the component.

## Related
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
