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

It is folded to show the agent's chain-of-thought reasoning process. The circle is highlighted during thinking and can be folded after completion. Use [AgentPlan](../agent-plan/agent-plan.md) for a structured list of steps, [ToolCall](../tool-call/tool-call.md) for a single tool call; here is free-text reasoning.

## Import
```ts
import { ThinkingBlock } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| thinking | `boolean` | `false` | Progressive state: title circle + highlight flowing, and expanded by default (agent is reasoning) |
| defaultOpen | `boolean` | With thinking | Uncontrolled initial expansion state |
| open | `boolean` | — | Controlled expansion state |
| className | `string` | — | Container class name |

## Events

| Event | Type | Description |
|------|------|------|
| onOpenChange | `(open: boolean) => void` | Expanded state change callback |

## Slots

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Header title; defaults to `\u601d\u8003\u8fc7\u7a0b` ("Thinking process") |
| duration | `ReactNode` | Muted duration label beside the title, such as "Thought for 3s" |
| children | `ReactNode` | Reasoning text (markdown recommended outsourcing `<Prose/>`) |

## Examples
```tsx
<ThinkingBlock duration="Thought for 3s">{reasoning}</ThinkingBlock>

// Inference: circle + highlight + default expansion
<ThinkingBlock thinking>{reasoning}</ThinkingBlock>
```

## Usage Guidelines

- Choose one of controlled/uncontrolled: `open` must be configured with `onOpenChange` and managed by yourself; you only want to use `defaultOpen` for the initial value.
- When `defaultOpen`/`open` is not passed, the expanded state defaults to `thinking` (expanded during thinking, collapsed after completion).

## Related
[ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Dossier](../dossier/dossier.md) · [Artifact](../artifact/artifact.md) · [ConfirmCard](../confirm-card/confirm-card.md) · [ThreadList](../thread-list/thread-list.md)
