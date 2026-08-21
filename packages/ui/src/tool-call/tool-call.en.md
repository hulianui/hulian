---
slug: tool-call
name: ToolCall
category: ai
group: agent
tags: []
exports: [ToolCall]
status: enriched
---

# ToolCall

> Shows an agent tool invocation, arguments, progress, result, and failure state. · ai/agent

## When to Use

Use it to present one agent tool invocation with its name, status, and collapsible input and result. Use [AgentPlan](../agent-plan/agent-plan.md) for multi-step orchestration and [ThinkingBlock](../thinking-block/thinking-block.md) for free-form reasoning. ToolCall focuses on one tool's inputs and outputs.

## Import
```ts
import { ToolCall } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| status | `"pending" \| "running" \| "success" \| "error"` | `"success"` | Status label: `"\u7b49\u5f85"` (Waiting), `"\u8fd0\u884c\u4e2d"` (Running), `"\u5b8c\u6210"` (Complete), or `"\u5931\u8d25"` (Failed) |
| defaultOpen | `boolean` | - | Uncontrolled initial expansion state |
| open | `boolean` | - | Controlled expansion state |
| className | `string` | - | Container class name |

## Events

| Event | Type | Description |
|------|------|------|
| onOpenChange | `(open: boolean) => void` | Expanded state change callback |

## Slots

| Slot | Type | Description |
|------|------|------|
| name * | `ReactNode` | Tool name rendered in monospace, such as `search_web` |
| icon | `ReactNode` | Tool icon slot (default Wrench) |
| input | `ReactNode` | Input shown below the built-in **Input** heading; typically `<CodeBlock/>` or JSON text |
| output | `ReactNode` | Result shown below the built-in **Output** heading; typically `<CodeBlock/>`, `<Prose/>`, or text |
| children | `ReactNode` | Customize panel content (replace input/output) |

Status, Input, and Output labels follow the nearest `ConfigProvider` locale. They retain the Chinese defaults when no provider is present.

## Examples
```tsx
<ToolCall
  name="search_web"
  status="success"
  defaultOpen
  input={<CodeBlock lang="json" code={'{ "query": "Hulian design system" }'} />}
  output="Found 3 relevant results, synthesized."
/>

<ToolCall name="run_code" status="running" />
```

## Usage Guidelines

- Choose controlled or uncontrolled expansion. Pair `open` with `onOpenChange`; use `defaultOpen` only for the initial uncontrolled state.
- `children` replaces the standard `input` and `output` panel, so choose one composition mode.

## Related
[ThinkingBlock](../thinking-block/thinking-block.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Dossier](../dossier/dossier.md) · [Artifact](../artifact/artifact.md) · [ConfirmCard](../confirm-card/confirm-card.md) · [ThreadList](../thread-list/thread-list.md)
