---
slug: prompt-suggestions
name: PromptSuggestions
category: ai
group: assist
tags: []
exports: [PromptSuggestions]
status: enriched
---

# PromptSuggestions

> 建议提示 · 可点击 pill 列表 + string/{label,value} 两式 + onSelect 回传 value 填充输入或发起对话 · ai/assist

## 何时用

在对话输入区上方给出一组可点击的引导提示 pill（点击后填充输入框或直接发起对话）时用。区别于 [MessageActions](../message-actions/message-actions.md)（针对已生成消息的操作），本组件面向「下一步问什么」的引导；点选回传 value 由消费侧决定填充还是发送。

## 导入
```ts
import { PromptSuggestions } from "@hulianui/ui"
```

## Props

继承 `Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "title">`，额外：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| suggestions* | `Suggestion[]` | — | 建议列表 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSelect | `(value: string) => void` | 点击某项回调（回传其 value） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 可选标题（列表上方弱化） |

`Suggestion`：`string`（label 即 value）或 `{ label: ReactNode; value?: string }`（分离展示文案与回传值）。

## 示例
```tsx
<PromptSuggestions
  title="你可以试试"
  suggestions={["帮我重写首页文案", "解释这段代码", { label: "翻译成英文", value: "translate" }]}
  onSelect={(v) => fillInput(v)}
/>
```

## 禁忌 / 坑

- `onSelect` 与 `title` 已从原生 HTMLAttributes 中 Omit 重定义——别误以为是原生 DOM 事件/属性签名。
- 用 `{ label, value }` 式时若省略 `value`，回传的是 label（ReactNode）派生值；需要稳定标识符就显式给 `value`。
- 暂无其它已知坑。

## 相关
[StreamingText](../streaming-text/streaming-text.md) · [MessageActions](../message-actions/message-actions.md) · [Citation](../citation/citation.md) · [Conversation](../conversation/conversation.md) · [ChatMessage](../chat-message/chat-message.md) · [PromptInput](../prompt-input/prompt-input.md)
