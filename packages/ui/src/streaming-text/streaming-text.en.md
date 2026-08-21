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

> Streaming text · Renders parent-accumulated text as tokens arrive + trailing blinking cursor while streaming · Unlike self-timed typing animation · presentational and RSC-safe · ai/assist · #animated

## When to Use

Renders an accumulated text driven by an SSE/fetch stream that grows as tokens arrive, displaying a trailing blinking cursor while in progress. Different from TypingAnimation (internal self-driven timing word-by-word typing), this component does not create words by itself - it only renders the `text` passed in by the parent, and the cursor is controlled by `streaming`.

## Import
```ts
import { StreamingText } from "@hulianui/ui"
```

## Props

Inherits `HTMLAttributes<HTMLElement>`, additionally:

| Name | Type | Default | Description |
|------|------|------|------|
| text* | `string` | - | Current accumulated text (increased by parent as token arrives) |
| streaming | `boolean` | - | Streaming in progress: trailing flashing cursor; cursor removed after done |
| as | `ElementType` | `"span"` | Render Tag |

## Slots

| Slot | Type | Description |
|------|------|------|
| cursor | `ReactNode` | Custom cursor node (default flashing vertical line) |

## Examples
```tsx
// Text is accumulated by the streaming client; turn streaming off when complete.
<StreamingText text={text} streaming={!done} />

// Static fragment + resident cursor (such as "thinking" placeholder)
<StreamingText text="Thinking through your question" streaming />
```

## Usage Guidelines

- This component does not generate or reveal text itself. The parent must append tokens to `text`; passing complete static text renders it immediately.
- Be sure to set `streaming` to false at the end of streaming, otherwise the cursor will keep flashing.
- Keep the accumulated text stable across reconnects to avoid visibly replaying or dropping tokens.

## Related
[PromptSuggestions](../prompt-suggestions/prompt-suggestions.md) · [MessageActions](../message-actions/message-actions.md) · [Citation](../citation/citation.md) · [Conversation](../conversation/conversation.md) · [ChatMessage](../chat-message/chat-message.md) · [PromptInput](../prompt-input/prompt-input.md)
