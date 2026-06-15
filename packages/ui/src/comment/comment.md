---
slug: comment
name: Comment
category: data-display
group: info
tags: []
exports: [Comment, CommentActions, CommentAction, commentActionVariants]
status: enriched
---

# Comment

> 评论 · 嵌套回复缩进 + 可选连接线 + 操作区 + comment/log 类型(复用 Avatar/Link·RSC) · data-display/info

## 何时用

讨论线程 / 工单评论 / 系统操作日志的混排（嵌套回复缩进 + 操作区）。`type="comment"` 渲气泡正文，`type="log"` 渲弱化单行日志。作者区可直接塞 [[User](../user/user.md)]；纯时间戳用 RelativeTime。

## 导入
```ts
import { Comment, CommentActions, CommentAction, commentActionVariants } from "@hulianui/ui"
```

## Props

### Comment

**Props**

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| avatar | `AvatarProps` | — | 透传瑚琏 Avatar（src/alt/fallback/size）；type=log 时忽略，改渲系统点标记。 |
| type | `"comment" \| "log"` | `"comment"` | 评论类型。 |
| connector | `boolean` | `false` | 子评论区是否画左侧连接线（默认仅缩进）。 |
| className | `string` | — | 其余 `HTMLAttributes<HTMLElement>`（已 Omit `content`/`title`）。 |

**Slots**

| 插槽 | 类型 | 说明 |
|------|------|------|
| author* | `ReactNode` | 作者名（必填）；可传 User 组合件。 |
| datetime | `ReactNode` | 时间戳（相对/绝对皆可）。 |
| content | `ReactNode` | 正文：comment 渲为下方段落；log 内联在作者后。 |
| actions | `ReactNode` | 操作区（点赞/回复等），建议用 CommentAction 组合。 |
| children | `ReactNode` | 嵌套子评论（递归 Comment）；自动缩进 + 可选左侧连接线。 |

### CommentAction

**Props**

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| href | `string` | — | 传则渲为瑚琏 Link（链接型操作，如「回复」跳锚点）；否则 `<button>`。 |

**Slots**

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 操作内容；其余透传 button 属性。 |

## 示例
```tsx
const actions = (
  <>
    <CommentAction>👍 赞 12</CommentAction>
    <CommentAction href="#reply">回复</CommentAction>
  </>
)
<Comment author="瑚琏" datetime="2 小时前" avatar={{ fallback: "瑚" }} content="工单已分配，请跟进。" actions={actions} connector>
  <Comment author="李四" datetime="1 小时前" avatar={{ fallback: "李" }} content="收到，正在排查。" />
</Comment>
```
```tsx
// 系统日志混排
<Comment type="log" author="系统" content="将工单状态改为「处理中」" datetime="昨天 14:25" />
```

## 禁忌 / 坑

- `type="log"` 会忽略 `avatar`（改渲系统点标记）、`content` 内联在作者后；想要头像气泡正文用默认 `comment`。
- 嵌套靠 `children` 放子 `Comment` 递归实现，缩进自动；`connector` 连接线默认关，需显式开。
- `CommentAction` 有无 `href` 决定渲染成 Link 还是 button，跳锚点回复传 href，纯交互（点赞）不传。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
