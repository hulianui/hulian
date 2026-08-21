---
slug: task-runner
name: TaskRunner
category: ai
group: agent
tags: []
exports: [TaskRunner, resolveProgress, statusMeta]
status: enriched
---

# TaskRunner

> Summarizes agent task status, plan steps, completion progress, tags, and elapsed time. · ai/agent

## When to Use

Use it to present sequential task execution (sandbox startup, a deployment pipeline) with overall status, progress, per-step timing, active-step highlighting, and an elapsed-time footer. Unlike [AgentPlan](../agent-plan/agent-plan.md), TaskRunner adds execution status and timing, but the consumer remains responsible for advancing state.

## Import
```ts
import { TaskRunner, resolveProgress, statusMeta } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| steps* | `AgentTask[]` | - | Step list using `AgentTask`; use `meta` for per-step timing |
| status | `"idle" \| "running" \| "success" \| "error"` | `"idle"` | Overall running status: driver head logo color + progress bar tone |
| progress | `number` | - | Top progress 0-100; if omitted, the steps completion (done) ratio will be automatically derived |
| className | `string` | - | Container additional class |

## Slots

| Slot | Type | Description |
|------|------|------|
| title* | `ReactNode` | Card header title (such as `"Sandbox"`) |
| tag | `ReactNode` | Tag next to the title (such as `"node26"`), rendered as a light background Tag |
| statusLabel | `ReactNode` | Head logo text overlay; when omitted, press status derivation (Idle/Running/Done/Failed) |
| elapsed | `ReactNode` | The accumulated time on the left side of the bottom (such as `"3.12s"`) |
| footerStatus | `ReactNode` | Bottom right status text; replaced by footerExtra when it exists |
| headerExtra | `ReactNode` | Add to the right side of the head (buttons/menus, etc.) |
| footerExtra | `ReactNode` | Replace the bottom right content |

`AgentTask` step item `status`: `"done"` (completed, metadata can show elapsed time) / `"running"` (highlighted) / `"pending"` (hollow ring) / `"error"`.

## Examples
```tsx
const SANDBOX_STEPS: AgentTask[] = [
  { title: "Allocate microVM", status: "done", meta: "180ms" },
  { title: "Boot runtime · Node 26", status: "done", meta: "1082ms" },
  { title: "Execute main.js", status: "running", meta: "…" },
  { title: "Reclaim sandbox", status: "pending" },
];

<TaskRunner
  title="Sandbox"
  tag="node26"
  status="running"
  steps={SANDBOX_STEPS}
  progress={58}
  elapsed="3.12s"
  footerStatus="Executing…"
/>
```

## Usage Guidelines

- Pure display component: does not come with timer/step advancement. Run the driver (setInterval advances status, accumulate elapsed) on the consumer side, and feed in the derived steps/status/elapsed.
- When `progress` is omitted, it is automatically derived according to the proportion of done in steps; if you want smooth non-intact step progress (such as 58%), you must explicitly pass `progress`.
- `footerExtra` will overwrite `footerStatus`, do not expect both to be displayed at the same time.
- `resolveProgress` counts completed steps; error, running, and pending steps do not contribute to the derived percentage.

## Related
[ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Dossier](../dossier/dossier.md) · [Artifact](../artifact/artifact.md) · [ConfirmCard](../confirm-card/confirm-card.md)
