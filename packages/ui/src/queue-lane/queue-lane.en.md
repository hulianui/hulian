---
slug: queue-lane
name: QueueLane
category: data-display
group: collection
tags: []
exports: [QueueLane, groupByLane]
status: enriched
---

# QueueLane

> Priority queue board · read-only ordered lanes with aggregated headers, preserved FIFO order, visible-item limits, item drill-down, and an exported stable grouping helper · data-display/collection

## When to use

Use QueueLane to monitor ordered queues grouped by priority or category, such as a task bus or P0–P3 scheduler. The scheduler owns FIFO order and users cannot drag it. Use Kanban for manual workflow movement.

## Import
```ts
import { QueueLane, groupByLane } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| lanes* | `QueueLaneDef[]` | — | Ordered `{id, label, tone?, meta?}` lanes; tone is written directly as a CSS color. |
| items* | `T[]` | — | Controlled `{id, laneId}` items grouped by lane while preserving input order; unmatched items are omitted. |
| maxVisible | `number` | — | Maximum directly visible items per lane; omission shows all. |
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | Lane layout direction. |
| className | `string` | — | Root class name. |

`QueueItem` (the constraint on `items`; your own row data extends it freely)

| Name | Type | Default | Description |
|------|------|------|------|
| id * | `string` | — | Unique key. |
| laneId * | `string` | — | Owning lane id. It must match one of `lanes[].id`, otherwise the entry is dropped. |

## Events

| Event | Type | Description |
|------|------|------|
| onItemClick | `(item: T) => void` | Read-only item drill-down. |

## Slots

| Slot | Type | Description |
|------|------|------|
| renderItem* | `(item: T, index: number) => ReactNode` | Renders an item; index is its zero-based position within the lane. |
| renderLaneHeader | `(lane: QueueLaneDef, items: T[]) => ReactNode` | Custom lane metrics; default shows label, count, and metadata. |

## Example
```tsx
interface Job extends QueueItem { title: string; wait: string; executor: string }

const lanes: QueueLaneDef[] = [
  { id: "p0", label: "P0 Critical", tone: "var(--color-chart-3)", meta: "Avg 0.4s" },
  { id: "p1", label: "P1 High", tone: "var(--color-chart-4)", meta: "Avg 1.2s" },
];
const jobs: Job[] = [
  { id: "t1", laneId: "p0", title: "Real-time risk approval", wait: "0.2s", executor: "Sonnet 4.6" },
  { id: "t3", laneId: "p1", title: "Ticket intent classification", wait: "0.9s", executor: "Haiku 4.5" },
];

<QueueLane<Job>
  lanes={lanes}
  items={jobs}
  maxVisible={5}
  onItemClick={(job) => console.log(job.id)}
  renderItem={(job, index) => (
    <div>#{index + 1} {job.title} · waiting {job.wait}</div>
  )}
/>
```

## Usage notes

- Items are controlled and input order is FIFO. Apply sorting or aging before passing them.
- An unknown `laneId` silently omits the item; update lane definitions and mappings together.
- Tone is a raw inline CSS value. Token variables need the `--color-` prefix; see [[hulian-token-color-var-needs-color-prefix]].
- Overflow copy is built from Chinese `"\u8fd8\u6709 N \u6761"`, meaning “N more items.”
- Lane counts append `" \u6761"` (“ items”), and empty lanes show `"\u961f\u5217\u7a7a\u95f2"` (“Queue idle”).

## Related
[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
