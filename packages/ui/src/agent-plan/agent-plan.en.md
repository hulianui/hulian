---
slug: agent-plan
name: AgentPlan
category: ai
group: agent
tags: []
exports: [AgentPlan]
status: enriched
---

# AgentPlan

> Execution plan · Data-driven tasks with pending, running, completed, and failed states · Optional trailing metadata and borderless inline mode · Reuses Spinner · Presentational RSC · ai/agent

## When to Use

Use it to show an agent's structured, multi-step plan, including each task's status, details, and optional timing metadata. Use [ToolCall](../tool-call/tool-call.md) for one tool invocation and [ThinkingBlock](../thinking-block/thinking-block.md) for free-form reasoning.

## Import
```ts
import { AgentPlan } from "@hulianui/ui"
```

## Props

`AgentPlanProps`:

| Name | Type | Default | Description |
|------|------|------|------|
| tasks * | `AgentTask[]` | — | Task list (data-driven) |
| bare | `boolean` | `false` | Remove the outer border, background, and padding, leaving only the list for inline composition such as TaskRunner |
| strikeDone | `boolean` | `true` | Strike through completed tasks for plan semantics; set to `false` for an execution log that keeps completed entries solid |
| className | `string` | — | Container class name |

## Slots

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Header title; defaults to `"\u6267\u884c\u8ba1\u5212"` (Execution Plan); pass `null` to hide it |

`AgentTask`:

| Name | Type | Default | Description |
|------|------|------|------|
| title | `ReactNode` | — | Task title |
| status | `"pending" \| "running" \| "done" \| "error"` | `"pending"` | Task state: hollow ring for pending, spinner and highlighted row for running, check and optional strike-through for done, or X for error |
| detail | `ReactNode` | — | Muted supporting text below the title |
| meta | `ReactNode` | — | Muted, right-aligned trailing metadata such as `180ms` or a small badge |

## Examples
```tsx
<AgentPlan
  tasks={[
    { title: "Read existing page.tsx", status: "done", detail: "Used only Button" },
    { title: "Replace each section with @hulianui/ui", status: "running" },
    { title: "Verify light and dark themes with screenshots", status: "pending" },
  ]}
/>
```

## Usage Guidelines

- `tasks` is a required data array. The component does not manage progress; update the array in the consumer and re-render as tasks advance.
- When embedding the list in a component such as TaskRunner, use `bare` to remove the outer chrome. For execution-log semantics, set `strikeDone={false}` so completed entries remain solid.

## Related
[ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [Dossier](../dossier/dossier.md) · [Artifact](../artifact/artifact.md) · [ConfirmCard](../confirm-card/confirm-card.md) · [ThreadList](../thread-list/thread-list.md)
