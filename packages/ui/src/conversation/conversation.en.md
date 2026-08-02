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

> Message-flow container · Vertically stacks ChatMessage and follows new messages or streaming content at the bottom · Consumer-sized scrolling region · ai/conversation

## When to Use

Wrap a sequence of [ChatMessage](../chat-message/chat-message.md) items in a scrolling conversation that follows new messages and streaming tokens. Conversation owns stacking and scrolling only; ChatMessage renders each bubble and [PromptInput](../prompt-input/prompt-input.md) handles composer input.

## Import
```ts
import { Conversation } from "@hulianui/ui"
```

## Props

Inherit `HTMLAttributes<HTMLDivElement>` (including `className`, `children`, etc.).

| Name | Type | Default | Description |
|------|------|------|------|
| autoScroll | `boolean` | `true` | Automatically scroll to the bottom when the content changes (fitting chat flow/streaming token addition) |
| hideScrollbar | `boolean` | `false` | Hide scroll bar (content can still be scrolled, ChatGPT style immersive chat area) |

## Examples
```tsx
<Conversation className="h-72 w-full max-w-lg rounded-[var(--radius)] border border-border p-4">
<ChatMessage role="user" name="Me">Does Hulian support dark mode?</ChatMessage>
<ChatMessage role="assistant" name="Hulian AI">Yes. Both themes render without a flash.</ChatMessage>
</Conversation>
```

## Usage Guidelines

- The component has no intrinsic height. Give it a bounded height such as `h-72` or `h-dvh` so it becomes an independent scroller and `autoScroll` can follow the bottom; an unbounded container simply grows with its content.

## Related
[ChatMessage](../chat-message/chat-message.md) · [PromptInput](../prompt-input/prompt-input.md) · [TypingDots](../typing-dots/typing-dots.md) · [ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md)
