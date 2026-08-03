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

> Typing indicator · Three staggered CSS dots with reduced-motion handling and `role="status"` · Used by ChatMessage loading state · ai/conversation · #animated

## When to Use

Use it to indicate that another person or agent is typing. [ChatMessage](../chat-message/chat-message.md) already renders it for `loading`; use TypingDots directly only when a custom container needs the indicator on its own.

## Import
```ts
import { TypingDots } from "@hulianui/ui"
```

## Props

Inherit `HTMLAttributes<HTMLSpanElement>` (including `className`, etc.).

| Name | Type | Default | Description |
|------|------|------|------|
| label | `string` | `"\u6b63\u5728\u8f93\u5165"` (Typing) | Accessible status label announced through `role="status"` |

## Examples
```tsx
<TypingDots />

// inside the bubble
<span className="inline-flex rounded-[var(--radius)] bg-surface px-3.5 py-2.5">
  <TypingDots />
</span>
```

## Usage Guidelines

- The pure CSS animation honors `prefers-reduced-motion`; the dots stop bouncing automatically, so consumers do not need a separate motion check.

## Related
[Conversation](../conversation/conversation.md) · [ChatMessage](../chat-message/chat-message.md) · [PromptInput](../prompt-input/prompt-input.md) · [ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md)
