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

> 展示一次提交的分支、短哈希、说明和作者 · data-display/info

## 何时用

在部署列表、PR 列表、活动流的「Source / 提交」列展示一条 git 提交引用（分支 + 短哈希 + 信息 + 作者）。它是纯展示的单条引用：要展示部署/构建的生命周期态用 [DiffStat](../diff-stat/diff-stat.md)/[DeployStatus]，要呈现一组按时间排列的事件流用 [Timeline]；本组件只负责「一行提交」的标准化排版。

## 导入
```ts
import { GitCommit, shortSha, branchTone, type BranchTone } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| sha* | `string` | - | commit SHA，完整或短哈希均可，显示时按 `shaLength` 截短 |
| branch | `string` | - | 分支名；提供则前置分支图标 chip |
| author | `string` | - | 作者名 |
| href | `string` | - | 短哈希跳转链接，去 commit 详情 |
| shaLength | `number` | `7` | 短哈希显示位数 |
| colorBranch | `boolean` | `true` | 给分支名加色值标识（按分支名稳定取色的 soft badge），不同分支一眼可分 |
| layout | `"inline" \| "stacked"` | `"inline"` | inline 单行 / stacked 两行（信息在上、引用在下，列表/表格单元格刚需） |
| size | `"sm" \| "md"` | `"md"` | 尺寸 |
| className | `string` | - | 透传类名 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| message | `ReactNode` | 提交信息标题，单行截断；stacked 下作主行 |
| avatar | `ReactNode` | 作者头像槽，传 `<Avatar/>` 或任意节点，不与库强耦合 |

## 示例
```tsx
// inline 单行
<GitCommit sha="10577b9aaaa" branch="master" message="fix(www,mocks): ai-chat 部署站无响应" />

// stacked 两行（表格/列表单元格，带作者头像 + 可点击短哈希）
<GitCommit
  layout="stacked"
  sha="36e347faaa"
  branch="master"
  message="feat(www): 全局路由进度条"
  author="瑚琏"
  avatar={<Avatar>瑚</Avatar>}
  href="#36e347f"
/>
```

## 禁忌 / 坑
暂无已知坑。`shortSha` / `branchTone` 是导出的纯函数（截哈希 / 按分支名取色），可在表格 cell 渲染外复用与单测。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
