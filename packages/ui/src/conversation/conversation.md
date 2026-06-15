---
slug: conversation
name: Conversation
category: ai
group: conversation
tags: []
exports: [Conversation]
status: enriched
---

# Conversation

> 消息流容器 · 纵向堆叠 ChatMessage + 内容增长自动贴底(新消息/流式 token)·消费侧给高度获独立滚动区 · ai/conversation

## 何时用

聊天/对话界面里包裹一串 [ChatMessage](../chat-message/chat-message.md)，需要新消息或流式 token 追加时自动滚到底的滚动容器。它只管「消息流的滚动与堆叠」；单条气泡用 ChatMessage，底部输入用 [PromptInput](../prompt-input/prompt-input.md)。

## 导入
```ts
import { Conversation } from "@hulianui/ui"
```

## Props

继承 `HTMLAttributes<HTMLDivElement>`（含 `className`、`children` 等）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| autoScroll | `boolean` | `true` | 内容变化时自动滚到底（贴合聊天流 / 流式 token 追加） |
| hideScrollbar | `boolean` | `false` | 隐藏滚动条（内容仍可滚动，ChatGPT 式沉浸聊天区） |

## 示例
```tsx
<Conversation className="h-72 w-full max-w-lg rounded-[var(--radius)] border border-border p-4">
  <ChatMessage role="user" name="我">瑚琏支持暗色吗？</ChatMessage>
  <ChatMessage role="assistant" name="瑚琏 AI">支持，明暗双主题 0 闪烁。</ChatMessage>
</Conversation>
```

## 禁忌 / 坑

- 容器本身不带高度——必须由消费侧给定高度（如 `h-72` / `h-dvh`）才能形成独立滚动区与触发自动贴底，否则随父容器无限撑高、`autoScroll` 失效。

## 相关
[ChatMessage](../chat-message/chat-message.md) · [PromptInput](../prompt-input/prompt-input.md) · [TypingDots](../typing-dots/typing-dots.md) · [ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md)
