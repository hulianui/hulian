---
slug: typing-dots
name: TypingDots
category: ai
group: conversation
tags: [animated]
exports: [TypingDots]
status: enriched
---

# TypingDots

> 打字指示 · 三点交错弹跳(纯CSS·客户端组件) + reduced-motion停 + role=status·配 ChatMessage loading · ai/agent · #animated

## 何时用

「对方/agent 正在输入」的三点弹跳指示。气泡内的生成态通常直接用 [ChatMessage](../chat-message/chat-message.md) 的 `loading` 即可（内部就是它）；需要在自定义容器里单放时才直接用本组件。

## 导入
```ts
import { TypingDots } from "@hulianui/ui"
```

## Props

继承 `HTMLAttributes<HTMLSpanElement>`（含 `className` 等）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| label | `string` | `"正在输入"` | 无障碍标签（读屏播报，`role=status`） |

## 示例
```tsx
<TypingDots />

// 气泡内
<span className="inline-flex rounded-[var(--radius)] bg-surface px-3.5 py-2.5">
  <TypingDots />
</span>
```

## 禁忌 / 坑

- 纯 CSS 动画，已响应 `prefers-reduced-motion`（用户关动效时三点停止跳动）；无需自己加判断。

## 相关
[Conversation](../conversation/conversation.md) · [ChatMessage](../chat-message/chat-message.md) · [PromptInput](../prompt-input/prompt-input.md) · [ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md)
