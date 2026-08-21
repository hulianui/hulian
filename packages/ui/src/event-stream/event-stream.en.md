---
slug: event-stream
name: EventStream
category: data-display
group: collection
tags: []
exports: [EventStream]
status: enriched
---

# EventStream Event Stream

> Event stream · a continuous timeline for high-frequency machine events where semantic color makes anomalies immediately scannable · data-display/collection

## When to use

- Audit streams and governance interceptions
- CI pipeline stages
- Logs and alerts
- Any continuously appended sequence that must expose anomalies quickly

## When not to use

| Scenario | Use | Why |
|---|---|---|
| Conversation or topic list | `ThreadList` | Each item opens a conversation and emphasizes read progress. |
| Milestone narrative | `Timeline` | Sparse, manually curated points carry individual weight. |
| Priority-ordered work | `QueueLane` | The key information is backlog and waiting, not chronology. |

## Examples

```tsx
import { EventStream } from "@hulianui/ui";

<EventStream
  items={[
    { id: 1, ts: "09:12:01", tone: "success", title: "Build passed", meta: "2.1s" },
    { id: 2, ts: "09:12:44", tone: "danger", title: "Unauthorized write blocked",
      detail: "Target is outside the allowed scope", meta: "1.3ms" },
  ]}
  maxHeight={320}
  onItemClick={(e) => openDetail(e.id)}
/>
```

## Props

| Name | Type | Default | Description |
|---|---|---|---|
| `items` | `EventStreamItem[]` | - | Displayed in input order; the component does not sort. |
| `maxHeight` | `number \| string` | - | Enables internal scrolling when supplied. |
| `emptyText` | `ReactNode` | `"\u6682\u65e0\u4e8b\u4ef6"` | Empty text; the built-in Chinese means “No events.” |
| `onItemClick` | `(item) => void` | - | Enables clickable and keyboard-accessible items. |
| `live` | `boolean` | `false` | Fades newly appended items in once. |
| `side` | `"left" \| "right"` | `"left"` | Timeline side. |
| `defaultExpanded` | `boolean` | `false` | Initially expands detail content. |

### EventStreamItem

| Name | Type | Description |
|---|---|---|
| `id` | `string \| number` | Stable unique identity used by live-entry detection. |
| `ts` | `ReactNode` | Caller-formatted time. |
| `tone` | `"neutral" \| "info" \| "success" \| "warning" \| "danger"` | Semantic color, defaulting to neutral. |
| `title` | `ReactNode` | One-line event summary. |
| `detail` | `ReactNode` | Collapsible detail. |
| `meta` | `ReactNode` | Right-aligned duration or identifier. |
| `overridden` | `ReactNode` | Separate explanation for a manually overridden block. |

## Design decisions

**Time is not formatted.** Time zone, precision, and relative-versus-absolute policy belong to the caller's domain.

**`live` animates once, never continuously.** A long-running event stream should not create permanent motion noise.

**The first frame does not flash.** Existing items are treated as seen on initial mount so only later additions stand out.

**`overridden` remains a separate row.** “Blocked and then allowed” must remain distinguishable from “never blocked”; folding it into tone would lose audit meaning.

The override row prepends built-in Chinese `"\u5df2\u653e\u884c\uff1a"`, meaning “Allowed by override:”.
