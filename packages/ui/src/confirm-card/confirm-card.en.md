---
slug: confirm-card
name: ConfirmCard
category: ai
group: agent
tags: []
exports: [ConfirmCard]
status: enriched
---

# ConfirmCard

> Confirmation card · Human-in-the-loop field summary with confirm and correction actions, plus a locked result state · Reuses Button · ai/agent

## When to Use

Use it when a person must review structured fields and either confirm or request a correction before a high-risk agent action. [Artifact](../artifact/artifact.md) presents output content and [Dossier](../dossier/dossier.md) presents a case file; ConfirmCard combines label/value review, actions, and a locked post-action state.

## Import
```ts
import { ConfirmCard } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items* | `ConfirmCardItem[]` | — | Field summary array, each item `{ label, value }`, rendered as dl |
| acted | `"confirmed" \| "edited" \| null` | `null` | Controlled result that locks both actions and marks the selected outcome; renders `"\u5df2\u786e\u8ba4"` (Confirmed) or `"\u4fee\u6539\u4e2d"` (Editing) |
| className | `string` | — | Container additional classes |

## Events

| Event | Type | Description |
|------|------|------|
| onConfirm | `() => void` | Click to confirm the callback |
| onEdit | `() => void` | Click to modify callback; **If not provided, the modification button will not be rendered** (single action scene) |

## Slots

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Card header title (default `"\u8bf7\u786e\u8ba4\u4ee5\u4e0b\u4fe1\u606f"` ("Please confirm the following information")) |
| confirmText | `ReactNode` | Confirm button text (default `"\u786e\u8ba4\u65e0\u8bef"` ("Confirmed")) |
| editText | `ReactNode` | Modify button text (default `"\u9700\u8981\u4fee\u6539"` ("needs modification")) |

`ConfirmCardItem`：`{ label: ReactNode; value: ReactNode }`

## Examples
```tsx
const [acted, setActed] = useState<"confirmed" | "edited" | null>(null);

<ConfirmCard
title="Case File Summary · Please confirm"
  items={[
{ label: "Basic information", value: "Lin Wanqing · 138-0000-0000" },
{ label: "Job Intention", value: "Yunqi Technology·President's Personal Secretary" },
  ]}
  acted={acted}
  onConfirm={() => setActed("confirmed")}
  onEdit={() => setActed("edited")}
/>
```

## Usage Guidelines

- The edit button is omitted when `onEdit` is absent, avoiding an inert button in single-action flows. Provide both callbacks for two actions.
- `acted` is controlled. Write the chosen result back from the parent after an action, or the card will not enter its locked, marked state.

## Related
[ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Dossier](../dossier/dossier.md) · [Artifact](../artifact/artifact.md) · [ThreadList](../thread-list/thread-list.md)
