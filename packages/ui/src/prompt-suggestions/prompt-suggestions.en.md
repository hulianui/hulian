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

> Prompt suggestions · Clickable pill list + string or `{ label, value }` items + `onSelect` returns the value for composing or sending · ai/assist

## When to Use

Used when giving a set of clickable guidance prompts pill (click to fill in the input box or directly initiate a conversation) above the dialogue input area. Different from [MessageActions](../message-actions/message-actions.md) (for operations that have generated messages), this component is oriented to the guidance of "what to ask next"; click to return the value and the consumer side decides whether to fill or send it.

## Import
```ts
import { PromptSuggestions } from "@hulianui/ui"
```

## Props

Inherits `Omit<HTMLAttributes<HTMLDivElement>, "onSelect" | "title">`, additionally:

| Name | Type | Default | Description |
|------|------|------|------|
| suggestions* | `Suggestion[]` | — | Suggestion list |

## Events

| Event | Type | Description |
|------|------|------|
| onSelect | `(value: string) => void` | Click a callback (pass back its value) |

## Slots

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Optional title (weakened above list) |

`Suggestion`: `string` (label is value) or `{ label: ReactNode; value?: string }` (separate display copy and return value).

## Examples
```tsx
<PromptSuggestions
  title="You can try"
  suggestions={["Help me rewrite the homepage copy", "Explain this code", { label: "Translate into English", value: "translate" }]}
  onSelect={(v) => fillInput(v)}
/>
```

## Usage Guidelines

- `onSelect` and `title` have been redefined from Omit in native HTMLAttributes - don't mistake them for native DOM event/attribute signatures.
- If `value` is omitted when using the `{ label, value }` formula, the label (ReactNode) derived value will be returned; if a stable identifier is required, explicitly provide it to `value`.
- For non-string labels, provide an explicit `value`; otherwise the fallback string conversion may not be a stable prompt or identifier.

## Related
[StreamingText](../streaming-text/streaming-text.md) · [MessageActions](../message-actions/message-actions.md) · [Citation](../citation/citation.md) · [Conversation](../conversation/conversation.md) · [ChatMessage](../chat-message/chat-message.md) · [PromptInput](../prompt-input/prompt-input.md)
