---
slug: artifact
name: Artifact
category: ai
group: agent
tags: []
exports: [Artifact]
status: enriched
---

# Artifact

> Presents generated content with a title, version chip, action slot, and controlled or uncontrolled expansion. · ai/agent

## When to Use

Use it for a finished agent deliverable that needs a title, version, export actions, and collapsible long content. [Dossier](../dossier/dossier.md) is better for a multi-field case file, while [StreamingText](../streaming-text/streaming-text.md) handles progressively arriving plain text. Artifact is the container for the final result and its metadata.

## Import
```ts
import { Artifact } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| collapsedHeight | `number` | `240` | Maximum collapsed content height in pixels; `<=0` disables collapsing |
| defaultExpanded | `boolean` | `false` | Uncontrolled initial expansion state |
| expanded | `boolean` | - | Controlled expanded state; pair with `onExpandedChange` |
| className | `string` | - | Additional container class name |

## Events

| Event | Type | Description |
|------|------|------|
| onExpandedChange | `(expanded: boolean) => void` | Called when the requested expanded state changes |

## Slots

| Slot | Type | Description |
|------|------|------|
| title* | `ReactNode` | Header title |
| icon | `ReactNode` | Icon before title |
| version | `ReactNode` | Version label rendered as a small chip, such as `"v2"` |
| actions | `ReactNode` | Header actions, such as an export button |
| expandLabel | `ReactNode` | Collapsed-state button label; defaults to `"\u5c55\u5f00\u5168\u6587"` (Expand full text) |
| collapseLabel | `ReactNode` | Expanded-state button label; defaults to `"\u6536\u8d77"` (Collapse) |
| children | `ReactNode` | Artifact content |

## Examples
```tsx
<Artifact
title="Draft resume · Lin Wanqing"
  icon={<File className="size-4" />}
  version="v2"
actions={<Button size="sm" variant="ghost"> export </Button>}
>
  {longBody}
</Artifact>

// Do not fold (when the content is very short)
<Artifact title="Short deliverable" collapsedHeight={0}>
<p className="text-sm">A short piece of content that does not require folding. </p>
</Artifact>
```

## Usage Guidelines

- Choose controlled or uncontrolled state. When passing `expanded`, update it from `onExpandedChange`; otherwise the button cannot change the visible state. Use `defaultExpanded` only for an initial uncontrolled value.
- `collapsedHeight<=0` disables the height limit, fade, and expansion button. Avoid that setting for very long content.
- The similarly named pitfall [[release-pipeline-stale-artifact-picked-by-readdir-find]] concerns CI selecting a stale build artifact; it does not apply to this UI card.

## Related
[ThinkingBlock](../thinking-block/thinking-block.md) · [ToolCall](../tool-call/tool-call.md) · [AgentPlan](../agent-plan/agent-plan.md) · [Dossier](../dossier/dossier.md) · [ConfirmCard](../confirm-card/confirm-card.md) · [ThreadList](../thread-list/thread-list.md)
