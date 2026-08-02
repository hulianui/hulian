---
slug: chat-message
name: ChatMessage
category: ai
group: conversation
tags: []
exports: [ChatMessage]
status: enriched
---

# ChatMessage

> Conversation bubble · Right-aligned user, left-aligned assistant, and centered system variants · Avatar, name, timestamp, TypingDots loading state, and actions · ai/conversation

## When to Use

Render one user or assistant message, or a centered system notice. Use [Conversation](../conversation/conversation.md) for a scrolling message history and place MessageActions in the `actions` slot for controls below the bubble.

Avatar fallback copy and receipt accessibility labels follow the nearest `ConfigProvider` locale (`zhCN` by default, or `enUS`).

## Import
```ts
import { ChatMessage } from "@hulianui/ui"
```

## Props

Inherited from `Omit<HTMLAttributes<HTMLDivElement>, "title">`.

| Name | Type | Default | Description |
|------|------|------|------|
| role * | `"user" \| "assistant" \| "system"` | `"assistant"` (showcase) | User messages are right-aligned on a primary background, assistant messages are left-aligned on a surface background, and system notices are centered and muted |
| loading | `boolean` | `false` | Replaces the message body with TypingDots while the assistant response is being generated |
| status | `"sending" \| "sent" \| "read"` | — | User-only receipt: spinner with `"\u53d1\u9001\u4e2d"` (Sending), one check with `"\u5df2\u9001\u8fbe"` (Delivered), or two blue checks with `"\u5df2\u8bfb"` (Read) as the built-in `aria-label` |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Message body; pass plain text directly or wrap rendered Markdown in `<Prose />` |
| avatar | `ReactNode` | Avatar slot, typically a Hulian `<Avatar/>`; omitted avatars use `"\u6211"` (Me) for `user` or `"AI"` for `assistant`, while system messages render no avatar |
| name | `ReactNode` | Sender’s name (above the text) |
| timestamp | `ReactNode` | Timestamp (right side of name, weakened color) |
| actions | `ReactNode` | Action area below the bubble, typically `<MessageActions/>` |

## Examples
```tsx
<ChatMessage role="user" name="Me" timestamp="Just now">
Help me rewrite the homepage to be 100% dogfood
</ChatMessage>

<ChatMessage role="assistant" name="Hulian AI" loading>placeholder</ChatMessage>
```

## Usage Guidelines

- `status` receipts render only for `role="user"`; assistant and system messages ignore them.
- When `loading` is true, the text is replaced by TypingDots. `children` is only a placeholder and not displayed.

## Related
[Conversation](../conversation/conversation.md) · [PromptInput](../prompt-input/prompt-input.md) · [TypingDots](../typing-dots/typing-dots.md) · [ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md)
