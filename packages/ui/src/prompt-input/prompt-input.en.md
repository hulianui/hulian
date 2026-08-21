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

> Composes auto-growing prompts with submit, stop, keyboard, IME, and custom action controls. · ai/conversation

## When to Use

Use it as the composer at the bottom of a chat interface. It grows with its content, submits on Enter, and shows a stop button while generating. Render the message stream with [Conversation](../conversation/conversation.md) and [ChatMessage](../chat-message/chat-message.md); PromptInput handles composition and submission only.

## Import
```ts
import { PromptInput } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string` | - | Controlled value (with onValueChange) |
| defaultValue | `string` | `""` | Uncontrolled initial value |
| placeholder | `string` | `"\u53d1\u6d88\u606f\u2026"` ("Send a message...") | Placeholder prompt |
| loading | `boolean` | `false` | Generating: Send key becomes stop key, block submission |
| disabled | `boolean` | `false` | Disabled |
| maxRows | `number` | `8` | Maximum rows before the textarea scrolls internally |
| className | `string` | - | Container class name |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string) => void` | Value change callback |
| onSubmit | `(value: string) => void` | Submit (Enter or click Send); receive the current text after trim. Automatically clear internally when not under control |
| onStop | `() => void` | Click to stop callback (stop button is displayed during loading) |

## Slots

| Slot | Type | Description |
|------|------|------|
| actions | `ReactNode` | Operation slot on the left side of the bottom toolbar (switch chip for deep thinking/intelligent search, etc.) |
| trailing | `ReactNode` | Trailing slot on the right side of the bottom toolbar, before the send key (attachment/voice, etc. icon buttons) |

## Examples
```tsx
<PromptInput onSubmit={(v) => send(v)} />

// Generating: the send key becomes the stop key
<PromptInput loading defaultValue="Generating a response…" onStop={stop} />
```

## Usage Guidelines

- Choose one of controlled/uncontrolled: `value` must be configured with `onValueChange` to manage the status by itself; when it is not controlled (only `defaultValue`), it will be automatically cleared internally after submission, do not clear it externally.
- While `loading` is true, submission is blocked and the send button becomes a stop button. Pass `onStop`; otherwise the stop button has no action.
- Enter to submit, Shift+Enter to change line, and IME synthesis protection has been implemented internally (Chinese input and enter word selection will not be submitted by mistake).
- Built-in Chinese UI strings are `\u53d1\u6d88\u606f\u2026` ("Send a message..."), `\u505c\u6b62\u751f\u6210` ("Stop generating"), and `\u53d1\u9001` ("Send").

## Related
[Conversation](../conversation/conversation.md) · [ChatMessage](../chat-message/chat-message.md) · [TypingDots](../typing-dots/typing-dots.md) · [ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md)
