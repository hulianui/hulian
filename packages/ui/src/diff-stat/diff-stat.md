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

> 改动统计条 · +N −M 绿红格子条按比例填充(纯函数 splitBlocks 可测) + A/M/D/R 状态徽标 · 代码审查/PR 列表刚需·零依赖 · data-display/info

## 何时用

PR/提交列表里展示单文件改动量：`+N −M` 数字 + 绿红比例格子条 + 改动状态徽标。本组件是 git diff 统计的微件；要趋势折线用 [Sparkline](../sparkline/sparkline.md)，要文件改动状态角标的层级树用 [FileTree](../file-tree/file-tree.md)。

## 导入
```ts
import { DiffStat, splitBlocks } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| additions* | `number` | — | 新增行数 |
| deletions* | `number` | — | 删除行数 |
| status | `"added" \| "modified" \| "deleted" \| "renamed"` | — | 文件状态徽标（可选） |
| blocks | `number` | `5` | 绿红格子条总格数 |
| showCounts | `boolean` | `true` | 是否显示 +N −M 数字 |
| size | `"sm" \| "md"` | `"md"` | 尺寸 |
| className | `string` | — | 自定义类 |

## 示例
```tsx
<DiffStat additions={24} deletions={6} status="modified" />
<DiffStat additions={142} deletions={0} status="added" />
```

仅格子条（不显示数字）：
```tsx
<DiffStat additions={7} deletions={2} showCounts={false} size="sm" />
```

## 禁忌 / 坑

暂无已知坑。格子条按 `additions:deletions` 比例填充 `blocks` 格（纯函数 `splitBlocks`），二者全 0 时为空条。

## 相关

状态徽标跟随 `ConfigProvider`；组件为 client 组件，服务端组件仍可导入并渲染它。
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md) · [Dot](../dot/dot.md)
