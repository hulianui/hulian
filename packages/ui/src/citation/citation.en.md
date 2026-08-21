---
slug: citation
name: Citation
category: ai
group: assist
tags: []
exports: [Citation]
status: enriched
---

# Citation

> Renders an inline numbered source link with a title and source label. · ai/assist

## When to Use

Use it to mark a source inline within an agent response, combining a numeric reference marker, source title, and optional external link. It is a single inline citation that fits inside prose. [MessageActions](../message-actions/message-actions.md) instead provides message-level controls. Citation is a stateless presentational RSC.

## Import
```ts
import { Citation } from "@hulianui/ui"
```

## Props

Inherits `Omit<HTMLAttributes<HTMLElement>, "title">`, additionally:

| Name | Type | Default | Description |
|------|------|------|------|
| index | `number` | `1`(showcase) | Reference number (such as 1 → `[1]` index) |
| href | `string` | - | External link URL; if provided, it will be rendered as a new tab link |

## Slots

| Slot | Type | Description |
|------|------|------|
| title* | `ReactNode` | Required source title; the showcase starts with `"\u745a\u740f\u8bbe\u8ba1\u7cfb\u7edf\u6587\u6863"` (Hulian Design System Documentation) |
| source | `ReactNode` | Muted source name or domain beside the title; the showcase starts with `"hulian.dev"` |

> Showcase initial values belong only to gallery controls. The component does not supply them as runtime defaults; `title` is required rather than defaulted.

## Examples
```tsx
// External link + serial number + source
<Citation index={1} title="Base UI documentation" href="https://base-ui.com" source="base-ui.com" />

//Multiple text inline
<p className="text-sm leading-loose">
Hulian’s reachability comes from Base UI
  <Citation index={1} title="Base UI" href="https://base-ui.com" source="base-ui.com" />
, table capabilities come from TanStack
  <Citation index={2} title="TanStack Table" href="https://tanstack.com/table" source="tanstack.com" />
  .
</p>
```

## Usage Guidelines

- `title` replaces the native HTML attribute and means the source title; it is not a tooltip string.
- Without `href`, the component renders a non-linked local source label. With `href`, it renders an external link using `target="_blank"`.
- No additional usage constraints are currently known.

## Related
[StreamingText](../streaming-text/streaming-text.md) · [PromptSuggestions](../prompt-suggestions/prompt-suggestions.md) · [MessageActions](../message-actions/message-actions.md) · [Conversation](../conversation/conversation.md) · [ChatMessage](../chat-message/chat-message.md) · [PromptInput](../prompt-input/prompt-input.md)
