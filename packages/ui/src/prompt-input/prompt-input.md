---
slug: prompt-input
name: PromptInput
category: ai
group: conversation
tags: []
exports: [PromptInput]
status: enriched
---

# PromptInput

> 提示输入 · 自增高Textarea + 发送/停止键 + Enter提交/Shift+Enter换行/IME合成保护 + 受控非受控两用 + 左侧操作槽 · ai/conversation

## 何时用

聊天界面底部的消息输入框：自增高、Enter 提交、生成中切停止键。对话流上方的消息渲染用 [Conversation](../conversation/conversation.md) + [ChatMessage](../chat-message/chat-message.md)；这里只管输入与提交。

## 导入
```ts
import { PromptInput } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string` | — | 受控值（配 onValueChange） |
| defaultValue | `string` | `""` | 非受控初值 |
| placeholder | `string` | `"发消息…"` | 占位提示 |
| loading | `boolean` | `false` | 生成中：发送键变停止键、屏蔽提交 |
| disabled | `boolean` | `false` | 禁用 |
| maxRows | `number` | `8` | 自增高最大行数（超出滚动） |
| className | `string` | — | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: string) => void` | 值变化回调 |
| onSubmit | `(value: string) => void` | 提交（Enter 或点发送）；收到 trim 后的当前文本。非受控时内部自动清空 |
| onStop | `() => void` | 点停止回调（loading 时显示停止键） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| actions | `ReactNode` | 底部工具栏左侧操作槽（深度思考 / 智能搜索等开关 chip） |
| trailing | `ReactNode` | 底部工具栏右侧、发送键之前的尾随槽（附件 / 语音等图标按钮） |

## 示例
```tsx
<PromptInput onSubmit={(v) => send(v)} />

// 生成中：发送键变停止键
<PromptInput loading defaultValue="正在生成回答…" onStop={stop} />
```

## 禁忌 / 坑

- 受控/非受控二选一：传 `value` 必须配 `onValueChange` 自己管状态；非受控（仅 `defaultValue`）时提交后内部自动清空，别再外部清。
- `loading` 时屏蔽提交、发送键变停止键，配套传 `onStop` 否则停止键无响应。
- Enter 提交、Shift+Enter 换行，且内部已做 IME 合成保护（中文输入回车选词不会误提交）。

## 相关
[Conversation](../conversation/conversation.md) · [ChatMessage](../chat-message/chat-message.md) · [TypingDots](../typing-dots/typing-dots.md) · [ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md)
