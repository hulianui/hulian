---
slug: message-actions
name: MessageActions
category: ai
group: assist
tags: []
exports: [MessageActions]
status: enriched
---

# MessageActions

> Message action bar · Copy with clipboard feedback, regenerate, like, and dislike · Renders controls on demand · Fits the `ChatMessage` actions slot · ai/assist

## When to Use

Place it beneath a generated assistant message to provide copy, regenerate, like, and dislike controls—typically through the `actions` slot of [ChatMessage](../chat-message/chat-message.md). Unlike [PromptSuggestions](../prompt-suggestions/prompt-suggestions.md), which guides the next question, MessageActions handles feedback and reuse for the current message. Each button appears only when its content or callback is provided.

## Import
```ts
import { MessageActions } from "@hulianui/ui"
```

## Props

Inherits `HTMLAttributes<HTMLDivElement>`, additionally:

| Name | Type | Default | Description |
|------|------|------|------|
| content | `string` | — | Text copied by the built-in clipboard action; providing it displays the copy button and 1.5-second success feedback |

## Events

| Event | Type | Description |
|------|------|------|
| onCopy | `() => void` | Post-copy callback (in parallel with the built-in clipboard) |
| onRegenerate | `() => void` | Displays the regenerate button when provided |
| onLike | `() => void` | If provided, the like button will be displayed |
| onDislike | `() => void` | Displays the dislike button when provided |

## Slots

| Slot | Type | Description |
|------|------|------|
| children | `ReactNode` | Add custom operation keys |

## Examples
```tsx
// Full action set mounted in ChatMessage.
<ChatMessage
  role="assistant"
  name="Hulian AI"
  actions={
    <MessageActions
      content="Supports light and dark themes without a flash."
      onRegenerate={regen}
      onLike={up}
      onDislike={down}
    />
  }
>
  Supports light and dark themes without a flash.
</ChatMessage>
```

## Usage Guidelines

- Buttons render on demand: the copy button appears when `content` or `onCopy` is present; the remaining buttons appear when their corresponding callbacks are provided.
- Copying uses the Clipboard API and shows a checkmark for 1.5 seconds. `onCopy` runs in parallel for analytics or toast handling, so callers do not need to invoke `navigator.clipboard` again.
- Built-in accessible labels are Chinese: `\u5df2\u590d\u5236` ("Copied"), `\u590d\u5236` ("Copy"), `\u91cd\u65b0\u751f\u6210` ("Regenerate"), `\u8d5e` ("Like"), and `\u8e29` ("Dislike").

## Related
[StreamingText](../streaming-text/streaming-text.md) · [PromptSuggestions](../prompt-suggestions/prompt-suggestions.md) · [Citation](../citation/citation.md) · [Conversation](../conversation/conversation.md) · [ChatMessage](../chat-message/chat-message.md) · [PromptInput](../prompt-input/prompt-input.md)
