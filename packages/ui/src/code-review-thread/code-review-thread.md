---
slug: code-review-thread
name: CodeReviewThread
category: data-display
group: collection
tags: []
exports: [CodeReviewThread, severityStyle, SEVERITY]
status: enriched
---

# CodeReviewThread

> 代码评审线程 · 代码审查评论线程 · severity 左边色条(四级语气) + AI/人类作者 + 内嵌建议修改 diff 可采纳 + 回复/标记已解决·误报 + 折叠 · 嵌 code-diff annotations 槽或独立用·复用 Avatar/Tag/CodeDiff · data-display/collection

## 何时用

渲染一条围绕某段代码的审查讨论（AI/人类多轮评论 + 严重度 + 内嵌建议 diff + 解决/误报状态）时用。它是「一个话题的整条线程」；要展示纯代码增删行差异用 [CodeDiff]，要做通用富文本评论列表（无 severity/采纳建议语义）则自行用 Avatar + 列表组合。

## 导入
```ts
import { CodeReviewThread, severityStyle, SEVERITY } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| comments* | `ReviewComment[]` | — | 线程内评论数组（含作者 kind、severity、body、可选 suggestion）。 |
| status | `"open"｜"resolved"｜"wontfix"` | `open`（内部自管） | 线程状态；受控，传则由外部托管。 |
| replyable | `boolean` | `true` | 是否显示回复框。 |
| defaultCollapsed | `boolean` | `false` | 非受控初始折叠态。 |
| collapsed | `boolean` | — | 受控折叠（优先于 defaultCollapsed）。 |
| className | `string` | — | — |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onStatusChange | `(s: ReviewThreadStatus) => void` | 状态变更回调（status 受控时回写）。 |
| onReply | `(text: string) => void` | 提交回复回调。 |
| onAdoptSuggestion | `(commentId: string) => void` | 采纳某条建议修改回调。 |
| onCollapsedChange | `(v: boolean) => void` | 折叠态变更回调（collapsed 受控时回写）。 |

## 示例
```tsx
const comments = [
  {
    id: "c1",
    author: { name: "AI 审查官", kind: "ai" },
    severity: "critical",
    body: "未对 user 可能为 null 的情况做防御，登出态会崩溃。",
    time: "刚刚",
    suggestion: {
      oldText: "const name = user.profile.name;",
      newText: 'const name = user?.profile?.name ?? "";',
    },
  },
];

<CodeReviewThread comments={comments} />
```

已解决态：
```tsx
<CodeReviewThread comments={comments} status="resolved" />
```

## 禁忌 / 坑

暂无已知坑。`status` 与 `collapsed` 均为「传则受控、不传则内部自管」：受控时必须配 `onStatusChange` / `onCollapsedChange` 回写，否则交互无效。`collapsed` 优先级高于 `defaultCollapsed`，两者勿同时当真值传。

## 相关
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
