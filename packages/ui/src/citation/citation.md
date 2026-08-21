---
slug: citation
name: Citation
category: ai
group: assist
tags: []
exports: [Citation]
status: enriched
---

# Citation

> 在正文里内联标注一条来源，可点开原文 · ai/assist

## 何时用

在 agent 回答正文内联标注信息出处（序号角标 + 来源标题 + 可点外链）时用。本组件是内联的单条引用标记，适合穿插在文字流中；与 [MessageActions](../message-actions/message-actions.md)（消息级操作）正交。纯皮肤 RSC，无交互状态。

## 导入
```ts
import { Citation } from "@hulianui/ui"
```

## Props

继承 `Omit<HTMLAttributes<HTMLElement>, "title">`，额外：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| index | `number` | `1`(showcase) | 引用序号（如 1 → `[1]` 角标） |
| href | `string` | - | 外链 URL；提供则渲染为新标签页链接 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title* | `ReactNode` | 来源标题（必填；showcase 初值 `"瑚琏设计系统文档"`） |
| source | `ReactNode` | 来源名（域名/站点，标题右侧弱化；showcase 初值 `"hulian.dev"`） |

> showcase 初值仅为画廊控件初值，组件本身除 `title` 外无内置默认。

## 示例
```tsx
// 外链 + 序号 + 来源
<Citation index={1} title="Base UI 文档" href="https://base-ui.com" source="base-ui.com" />

// 正文内联多条
<p className="text-sm leading-loose">
  瑚琏的可达性来自 Base UI
  <Citation index={1} title="Base UI" href="https://base-ui.com" source="base-ui.com" />
  ，表格能力来自 TanStack
  <Citation index={2} title="TanStack Table" href="https://tanstack.com/table" source="tanstack.com" />
  。
</p>
```

## 禁忌 / 坑

- `title` 被从原生 HTMLAttributes 中 Omit 重定义为来源标题（非原生 tooltip title）。
- 不传 `href` 时渲染为非链接的本地来源标记；传了才是 target=_blank 外链。
- 暂无其它已知坑。

## 相关
[StreamingText](../streaming-text/streaming-text.md) · [PromptSuggestions](../prompt-suggestions/prompt-suggestions.md) · [MessageActions](../message-actions/message-actions.md) · [Conversation](../conversation/conversation.md) · [ChatMessage](../chat-message/chat-message.md) · [PromptInput](../prompt-input/prompt-input.md)
