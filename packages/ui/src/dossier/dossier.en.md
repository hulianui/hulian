---
slug: dossier
name: Dossier
category: ai
group: agent
tags: []
exports: [Dossier]
status: enriched
---

# Dossier

> Case panel · Visualization of agent slot filling progress: domain list + three states (hollow ring/half-filled/Check) + current collection domain highlighting + domain content summary + automatic progress (archived n/m·optional domain does not count in denominator) + bare embedded · presentational RSC · ai/agent

## When to Use

Use it to visualize an agent collecting information by domain or slot. Each section can be empty, partial, or complete; the current section is highlighted and archived progress is calculated automatically. Use [AgentPlan](../agent-plan/agent-plan.md) for linear tasks. Dossier is for domain-based collection such as an interview that fills a case file field by field.

## Import
```ts
import { Dossier } from "@hulianui/ui"
```

## Props

`DossierProps`:

| Name | Type | Default | Description |
|------|------|------|------|
| sections * | `DossierSection[]` | — | Domain list (data driven) |
| bare | `boolean` | `false` | Remove the container border background and use it inline |
| className | `string` | — | Container class name |

## Slots

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Header title (default `"\u6848\u5377"` ("Case File")) |
| progress | `ReactNode` | Header progress; defaults to `\u5df2\u5f52\u6863 ${done}/${required.length}` ("Archived n/m"), excluding optional sections from the denominator |

`DossierSection`:

| Name | Type | Default | Description |
|------|------|------|------|
| key * | `string` | — | Domain unique identifier |
| label * | `ReactNode` | — | Domain name |
| status | `"empty" \| "partial" \| "done"` | `"empty"` | Empty (hollow ring) / Half filled / Complete (tick) |
| optional | `boolean` | `false` | Optional section: excluded from the progress denominator and, when empty, dimmed and marked `"\u53ef\u9009"` ("Optional") |
| summary | `ReactNode` | — | Summary of archived content (one or two lines) |
| active | `boolean` | `false` | The domain currently being collected, highlighted |

## Examples
```tsx
<Dossier
  sections={[
{ key: "basic", label: "Basic information", status: "done", summary: "Lin Wanqing · 138-0000-0000" },
{ key: "education", label: "Education Background", status: "partial", active: true, summary: "Major reasons to be supplemented" },
{ key: "experience", label: "work experience", status: "empty" },
{ key: "extras", label: "optional supplement", status: "empty", optional: true },
  ]}
/>
```

## Usage Guidelines

- Optional sections are excluded from the automatic progress denominator. An empty optional section displays `"\u53ef\u9009"` ("Optional"); leave `optional` false or unset when a section must count.
- `sections` is data-driven. Advance progress by updating the array in the consumer and re-rendering. Use `bare` when embedding Dossier inside another card.

## Related
[ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Artifact](../artifact/artifact.md) · [ConfirmCard](../confirm-card/confirm-card.md) · [ThreadList](../thread-list/thread-list.md)
