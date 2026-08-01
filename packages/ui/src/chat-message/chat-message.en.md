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

> Conversation bubble · Right-aligned user, left-aligned assistant, and centered system variants · Avatar, name, timestamp, TypingDots loading state, and actions · Presentational RSC · ai/conversation

## When to Use

Render a single dialogue bubble (user/assistant/system notification). The scrolling stack of multiple bubbles is given to [Conversation](../conversation/conversation.md); the operation button under the bubble is put into the `actions` slot using MessageActions.

## Import
```ts
import { ChatMessage } from "@hulianui/ui"
```

## Props

Inherited from `Omit<HTMLAttributes<HTMLDivElement>, "title">`.

| Name | Type | Default | Description |
|------|------|------|------|
| role * | `"user" ｜ "assistant" ｜ "system"` | `"assistant"`(showcase) | user right-aligned (primary bottom) / assistant left-aligned (surface bottom) / system centered weakening notice |
| loading | `boolean` | `false` | Loading state: Text position displays TypingDots (agent is being generated) |
| status | `"sending" ｜ "sent" ｜ "read"` | — | User-only receipt: spinner with `"\u53d1\u9001\u4e2d"` (Sending), one check with `"\u5df2\u9001\u8fbe"` (Delivered), or two blue checks with `"\u5df2\u8bfb"` (Read) as the built-in `aria-label` |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Text; markdown is recommended to include `<Prose/>` in the outer layer, and the plain text can be transferred directly |
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

- `status` read receipts are only rendered in `role="user"` (right bubble) and are not displayed when passed to assistant/system.
- When `loading` is true, the text is replaced by TypingDots. `children` is only a placeholder and not displayed.

## Related
[Conversation](../conversation/conversation.md) · [PromptInput](../prompt-input/prompt-input.md) · [TypingDots](../typing-dots/typing-dots.md) · [ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md)
