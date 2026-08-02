---
slug: thinking-block
name: ThinkingBlock
category: ai
group: agent
tags: [animated]
exports: [ThinkingBlock]
status: enriched
---

# ThinkingBlock

> Collapsible thinking block · Reuses Collapsible with chevron and smooth height + active spinner/highlight + duration label + default expansion while thinking · ai/agent · #animated

## When to Use

Use it to disclose a concise, user-facing reasoning summary or progress narrative. The header is highlighted while work is in progress and can collapse after completion. Use [AgentPlan](../agent-plan/agent-plan.md) for structured steps or [ToolCall](../tool-call/tool-call.md) for one tool invocation.

## Import
```ts
import { ThinkingBlock } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| thinking | `boolean` | `false` | Active state with a spinner and highlight; also supplies the default expanded state |
| defaultOpen | `boolean` | With thinking | Uncontrolled initial expansion state |
| open | `boolean` | — | Controlled expansion state |
| className | `string` | — | Container class name |

## Events

| Event | Type | Description |
|------|------|------|
| onOpenChange | `(open: boolean) => void` | Called when the expanded state changes |

## Slots

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Header title; defaults to `\u601d\u8003\u8fc7\u7a0b` ("Thinking process") |
| duration | `ReactNode` | Muted duration label beside the title, such as "Thought for 3s" |
| children | `ReactNode` | Reasoning or progress content; wrap rendered Markdown in `<Prose />` |

## Examples
```tsx
<ThinkingBlock duration="Thought for 3s">{reasoning}</ThinkingBlock>

// Active reasoning state with spinner, highlight, and default expansion
<ThinkingBlock thinking>{reasoning}</ThinkingBlock>
```

## Usage Guidelines

- Choose either controlled or uncontrolled state. Pair `open` with `onOpenChange`; use `defaultOpen` only to set the initial uncontrolled value.
- When `defaultOpen`/`open` is not passed, the expanded state defaults to `thinking` (expanded during thinking, collapsed after completion).

## Related
[ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Dossier](../dossier/dossier.md) · [Artifact](../artifact/artifact.md) · [ConfirmCard](../confirm-card/confirm-card.md) · [ThreadList](../thread-list/thread-list.md)
