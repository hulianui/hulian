---
slug: streaming-text
name: StreamingText
category: ai
group: assist
tags: [animated]
exports: [StreamingText]
status: enriched
---

# StreamingText

> 流式文本 · 渲染父级累积 text(随token增长) + 流式中尾随闪烁光标(hulian-blink) · 区别 TypingAnimation 自驱定时 · 纯皮肤RSC · ai/assist · #animated

## 何时用

渲染由 SSE/fetch stream 驱动、随 token 到达不断增长的累积文本，并在进行中显示尾随闪烁光标时用。区别于 TypingAnimation（内部自驱定时逐字打字），本组件不自己造字——只渲染父级传入的 `text`，光标由 `streaming` 控制。

## 导入
```ts
import { StreamingText } from "@hulianui/ui"
```

## Props

继承 `HTMLAttributes<HTMLElement>`，额外：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| text* | `string` | — | 当前累积文本（随 token 到达由父级增长） |
| streaming | `boolean` | — | 流式进行中：尾随闪烁光标；done 后去除光标 |
| as | `ElementType` | `"span"` | 渲染标签 |
| cursor | `ReactNode` | — | 自定义光标节点（默认闪烁竖线） |

## 示例
```tsx
// 实战：text 由流式接口推进，done 时关 streaming
<StreamingText text={text} streaming={!done} />

// 静态片段 + 常驻光标（如「正在思考」占位）
<StreamingText text="正在思考你的问题" streaming />
```

## 禁忌 / 坑

- 纯皮肤组件：不自己造字。`text` 必须由父级累积增长（SSE/stream），传静态全文不会有逐字效果。
- 流式结束务必把 `streaming` 置 false，否则光标一直闪。
- 暂无其它已知坑。

## 相关
[PromptSuggestions](../prompt-suggestions/prompt-suggestions.md) · [MessageActions](../message-actions/message-actions.md) · [Citation](../citation/citation.md) · [Conversation](../conversation/conversation.md) · [ChatMessage](../chat-message/chat-message.md) · [PromptInput](../prompt-input/prompt-input.md)
